import { useState, useCallback, useEffect, useRef } from 'react';
import { Logo, SnackbarProvider } from '@transferwise/components';
import { Agentation } from 'agentation';
import { ScreenGallery, GALLERY_CSS } from './components/ScreenGallery';
import { LanguageProvider, useLanguage } from './context/Language';
import { DatasetProvider, useDataset } from './context/Dataset';
import { PrototypeNamesProvider, usePrototypeNames } from './context/PrototypeNames';
import { LiveRatesProvider } from './context/LiveRates';
import { ShimmerProvider } from './context/Shimmer';
import { SideNav } from './components/SideNav';
import { TopBar } from './components/TopBar';
import { SidebarOverlay } from './components/SidebarOverlay';
import { MobileNav } from './components/MobileNav';
import { PrototypeSettings } from './components/PrototypeSettings';
import { Home } from './pages/Home';
import { Cards } from './pages/Cards';
import { Transactions } from './pages/Transactions';
import { Payments } from './pages/Payments';
import { Recipients } from './pages/Recipients';
import { Insights } from './pages/Insights';
import { Account } from './pages/Account';
import { AccountPage } from './pages/AccountPage';
import { CurrencyPage } from './pages/CurrencyPage';
import { AccountDetailsList } from './pages/AccountDetailsList';
import { AccountDetailsPage } from './pages/AccountDetailsPage';
import { Team } from './pages/Team';
import { OpenPlus } from './pages/OpenPlus';
import { TravelHub } from './pages/TravelHub';
import { AddMoneyFlow } from './flows/AddMoneyFlow';
import { ConvertFlow } from './flows/ConvertFlow';
import { SendFlow } from './flows/SendFlow';
import { RequestFlow } from './flows/RequestFlow';
import { PaymentLinkFlow } from './flows/PaymentLinkFlow';
import { personalNav, businessNav } from './data/nav';
import { useActiveCurrencies, useActiveJars } from './hooks/useDatasetData';
import { useVisibleAccounts } from './hooks/useAccountRegistry';
import { accountRegistry, getAccountById, getAccountBySubPageType, buildBalanceOwnerMap, type AccountStyle } from '@shared/data/account-registry';
import { getJar, GROUP_IDS } from '@shared/data/jar-data';

export type AccountType = 'personal' | 'business';

type SubPage =
  | { type: 'account' }
  | { type: 'group-account' }
  | { type: 'shared-spending-account' }
  | { type: 'joint-account' }
  | { type: 'young-explorer-account' }
  | { type: 'jar-account'; jarId: string }
  | { type: 'currency'; code: string; from?: 'account' | 'home' | 'group-account' | 'jar-account' | 'shared-spending-account' | 'joint-account' | 'young-explorer-account'; group?: string; jarId?: string; joint?: boolean; youngExplorer?: boolean }
  | { type: 'account-details-list'; from: string; accountScope?: string }
  | { type: 'account-details'; code: string; from: 'currency' | 'account-details-list' | 'payments'; group?: string; listFrom?: string; joint?: boolean; youngExplorer?: boolean }
  | { type: 'travel-hub' }
  | null;

function getInitials(name: string): string {
  return name.split(/\s+/).map((w) => w[0] || '').join('').toUpperCase();
}

type SendRecipient = {
  name: string;
  subtitle: string;
  avatarUrl?: string;
  initials?: string;
  hasFastFlag: boolean;
  badgeFlagCode?: string;
};

type ActiveFlow =
  | { type: 'add-money'; defaultCurrency: string; accountLabel: string; accountStyle: AccountStyle }
  | { type: 'convert'; fromCurrency: string; toCurrency: string; accountLabel: string; toAccountLabel?: string; group?: string; jarId?: string; accountStyle: AccountStyle; toAccountStyle?: AccountStyle }
  | { type: 'send'; defaultCurrency: string; accountLabel: string; group?: string; accountStyle: AccountStyle; recipient?: SendRecipient; prefillAmount?: number; prefillReceiveAmount?: number; startStep?: 'recipient' | 'amount'; forcedReceiveCurrency?: string; step?: string; forceClose?: boolean }
  | { type: 'request'; defaultCurrency: string; accountLabel: string; group?: string; accountStyle?: AccountStyle; step?: string; startStep?: 'recipient' | 'request'; recipient?: SendRecipient }
  | { type: 'payment-link'; defaultCurrency: string; accountLabel: string; group?: string; accountStyle?: AccountStyle }
  | { type: 'open-plus' }
  | null;

function flowToPath(flow: ActiveFlow): string | null {
  if (!flow) return null;
  switch (flow.type) {
    case 'send': return `/send/${flow.step ?? 'recipient'}`;
    case 'request': return `/request/${flow.step ?? 'recipient'}`;
    case 'convert': return '/convert';
    case 'add-money': return '/add';
    case 'payment-link': return '/request';
    case 'open-plus': return '/open';
  }
}

// ── URL ↔ State routing helpers ──────────────────────────────────────────────

import { currencies } from '@shared/data/currencies';
import { businessCurrencies } from '@shared/data/business-currencies';
import { connorPersonalCurrencies } from '@shared/data/connor-personal-currencies';
import { connorBusinessCurrencies } from '@shared/data/connor-business-currencies';
import { commonCurrencies, commonBusinessCurrencies } from '@shared/data/common-currencies';
import { connorPersonalJars } from '@shared/data/connor-personal-jars';
import { connorBusinessJars } from '@shared/data/connor-business-jars';
import { savingsJar, suppliesJar } from '@shared/data/jar-data';

const balanceOwnerMap = buildBalanceOwnerMap();
for (const c of [...currencies, ...businessCurrencies, ...connorPersonalCurrencies, ...connorBusinessCurrencies, ...commonCurrencies, ...commonBusinessCurrencies]) {
  balanceOwnerMap.set(c.balanceId, { code: c.code, from: 'home' });
}
for (const jar of [savingsJar, suppliesJar, ...connorPersonalJars, ...connorBusinessJars]) {
  for (const c of jar.currencies) balanceOwnerMap.set(c.balanceId, { code: c.code, from: 'jar-account', jarId: jar.id });
}

function parseUrl(pathname: string): { navItem: string; subPage: SubPage } {
  // /groups/:id (8-digit numeric IDs)
  const groupMatch = pathname.match(/^\/groups\/(\d+)$/);
  if (groupMatch) {
    const id = groupMatch[1];
    const registryAccount = getAccountById(id);
    if (registryAccount) {
      return { navItem: 'Home', subPage: { type: registryAccount.subPageType } as SubPage };
    }
    return { navItem: 'Home', subPage: { type: 'jar-account', jarId: id } };
  }

  // /balances/:balanceId — group context derived from the balanceId itself
  const balanceMatch = pathname.match(/^\/balances\/(\d+)$/);
  if (balanceMatch) {
    const owner = balanceOwnerMap.get(balanceMatch[1]);
    if (owner) {
      return { navItem: 'Home', subPage: { type: 'currency', code: owner.code, from: owner.from as any, group: owner.group, jarId: owner.jarId, joint: owner.from === 'joint-account' || undefined, youngExplorer: owner.from === 'young-explorer-account' || undefined } };
    }
  }

  // /account-details/:id — if id matches a group ID → list, otherwise → individual balance detail
  const detailsMatch = pathname.match(/^\/account-details\/(\d+)$/);
  if (detailsMatch) {
    const id = detailsMatch[1];
    // Known group ID → account details list for that group
    const allGroupIds = new Set<string>(Object.values(GROUP_IDS));
    if (allGroupIds.has(id)) {
      return { navItem: 'Home', subPage: { type: 'account-details-list', from: 'account' } };
    }
    // Balance ID → individual account details page
    const owner = balanceOwnerMap.get(id);
    if (owner) {
      return { navItem: 'Home', subPage: { type: 'account-details', code: owner.code, from: 'account-details-list', group: owner.group } };
    }
  }

  // Flow paths — can't reconstruct flow state from URL, so fall through to Home
  if (pathname.startsWith('/send/') || pathname === '/convert' || pathname === '/add' || pathname.startsWith('/request/') || pathname === '/payment-link' || pathname === '/open') {
    return { navItem: 'Home', subPage: null };
  }

  // Top-level nav pages
  switch (pathname) {
    case '/your-account': return { navItem: 'Account', subPage: null };
    case '/cards': return { navItem: 'Cards', subPage: null };
    case '/cards/travel-hub': return { navItem: 'Cards', subPage: { type: 'travel-hub' } };
    case '/all-transactions': return { navItem: 'Transactions', subPage: null };
    case '/payments': return { navItem: 'Payments', subPage: null };
    case '/recipients': return { navItem: 'Recipients', subPage: null };
    case '/account-summary': return { navItem: 'Insights', subPage: null };
    case '/team': return { navItem: 'Team', subPage: null };
    default: return { navItem: 'Home', subPage: null };
  }
}

function stateToPath(navItem: string, subPage: SubPage, accountType: AccountType, datasetCurrencies?: import('@shared/data/currencies').CurrencyData[]): string {
  const mainCurrencies = datasetCurrencies ?? (accountType === 'business' ? businessCurrencies : currencies);
  const resolveCurrencyList = (sp: { group?: string; joint?: boolean; youngExplorer?: boolean; jarId?: string }) => {
    if (sp.jarId) { const j = getJar(sp.jarId); return j ? j.currencies : mainCurrencies; }
    const subPageType = sp.group === 'shared-spending' ? 'shared-spending-account' : sp.group ? 'group-account' : sp.joint ? 'joint-account' : sp.youngExplorer ? 'young-explorer-account' : undefined;
    if (subPageType) { const acct = getAccountBySubPageType(subPageType); return acct ? acct.getCurrencies() : mainCurrencies; }
    return mainCurrencies;
  };
  if (subPage) {
    switch (subPage.type) {
      case 'account':
      case 'group-account':
      case 'shared-spending-account':
      case 'joint-account':
      case 'young-explorer-account': {
        const acct = accountRegistry.find((a) => a.subPageType === subPage.type);
        return `/groups/${acct?.id ?? GROUP_IDS.currentAccount}`;
      }
      case 'jar-account': return `/groups/${subPage.jarId}`;
      case 'currency': {
        const currencyList = resolveCurrencyList(subPage);
        const currencyData = currencyList.find((c) => c.code === subPage.code);
        return `/balances/${currencyData?.balanceId ?? subPage.code}`;
      }
      case 'account-details-list': {
        // Use accountScope (account ID) if available, otherwise default to current account
        const targetAccountId = subPage.accountScope || GROUP_IDS.currentAccount;
        return `/account-details/${targetAccountId}`;
      }
      case 'account-details': {
        const currencyList = resolveCurrencyList(subPage);
        const currencyData = currencyList.find((c) => c.code === subPage.code);
        return `/account-details/${currencyData?.balanceId ?? subPage.code}`;
      }
      case 'travel-hub': return '/cards/travel-hub';
    }
  }
  switch (navItem) {
    case 'Account': return '/your-account';
    case 'Cards': return '/cards';
    case 'Transactions': return '/all-transactions';
    case 'Payments': return '/payments';
    case 'Recipients': return '/recipients';
    case 'Insights': return '/account-summary';
    case 'Team': return '/team';
    default: return '/home';
  }
}

// ── App ─────────────────────────────────────────────────────────────────────

// Detect gallery iframe mode (loaded by ScreenGallery)
const isGalleryMode = new URLSearchParams(window.location.search).has('gallery');

function AppInner() {
  const { consumerName, businessName, consumerHomeCurrency, businessHomeCurrency } = usePrototypeNames();
  const { t } = useLanguage();
  const { dataset } = useDataset();

  // Initialise state from the current URL
  const initial = parseUrl(window.location.pathname);
  const params = new URLSearchParams(window.location.search);
  const [activeNavItem, setActiveNavItem] = useState(initial.navItem);
  const [previousNavItem, setPreviousNavItem] = useState('Home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [subPage, setSubPage] = useState<SubPage>(initial.subPage);
  const [accountType, setAccountType] = useState<AccountType>(() => params.get('account') === 'business' ? 'business' : 'personal');
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>(null);

  const activeCurrencies = useActiveCurrencies(accountType);

  // Auto-open flow when loaded with ?flow= (gallery preview)
  useEffect(() => {
    if (!isGalleryMode) return;
    const flowParam = params.get('flow');
    if (!flowParam) return;
    const stepParam = params.get('step');
    const homeCurrency = accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency;
    const regCA = getAccountBySubPageType('account')!;
    const style: AccountStyle = accountType === 'business'
      ? { color: regCA.style.textColor, textColor: regCA.style.color, iconName: 'Wise' }
      : { color: 'var(--color-interactive-accent)', textColor: 'var(--color-interactive-control)', iconName: 'Wise' };
    switch (flowParam) {
      case 'send': {
        const previewRecipient = stepParam === 'amount'
          ? accountType === 'business'
            ? { name: 'Acme Corp', subtitle: 'Barclays Bank ending ·· 7821', initials: 'AC', hasFastFlag: false, badgeFlagCode: 'GBP' }
            : { name: 'Christie Davis', subtitle: '@christied25', initials: 'CD', hasFastFlag: true, badgeFlagCode: 'GBP' }
          : undefined;
        setActiveFlow({ type: 'send', defaultCurrency: homeCurrency, accountLabel: 'Current account', accountStyle: style, startStep: (stepParam as 'recipient' | 'amount') ?? 'recipient', recipient: previewRecipient });
        break;
      }
      case 'request': {
        const previewRecipient = stepParam === 'request'
          ? { name: 'Christie Davis', subtitle: '@christied25', initials: 'CD', hasFastFlag: true, badgeFlagCode: 'GBP' }
          : undefined;
        setActiveFlow({ type: 'request', defaultCurrency: homeCurrency, accountLabel: 'Current account', group: undefined, step: stepParam ?? 'recipient', startStep: (stepParam as 'recipient' | 'request') ?? 'recipient', recipient: previewRecipient });
        break;
      }
      case 'convert': setActiveFlow({ type: 'convert', fromCurrency: homeCurrency, toCurrency: 'EUR', accountLabel: 'Current account', accountStyle: style }); break;
      case 'add-money': setActiveFlow({ type: 'add-money', defaultCurrency: homeCurrency, accountLabel: 'Current account', accountStyle: style }); break;
      case 'payment-link': setActiveFlow({ type: 'payment-link', defaultCurrency: homeCurrency, accountLabel: 'Current account' }); break;
      case 'open-plus': setActiveFlow({ type: 'open-plus' }); break;
    }
  }, []);

  // Sync URL when state changes (skip when handling popstate, skip in gallery mode)
  const isPopstateRef = useRef(false);
  useEffect(() => {
    if (isGalleryMode) return;
    if (isPopstateRef.current) { isPopstateRef.current = false; return; }
    const target = activeFlow ? flowToPath(activeFlow) : stateToPath(activeNavItem, subPage, accountType, activeCurrencies);
    if (!target) return;
    const current = window.location.pathname + window.location.search;
    if (current !== target) {
      window.history.pushState(null, '', target);
    }
  }, [activeNavItem, subPage, activeFlow, accountType]);

  // Handle browser back/forward
  useEffect(() => {
    const handler = () => {
      isPopstateRef.current = true;
      const state = parseUrl(window.location.pathname);
      setActiveNavItem(state.navItem);
      setSubPage(state.subPage);
      setActiveFlow(null);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Handle navigate messages from ScreenGallery (works in Make where pushState is neutralised)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== 'navigate' || !e.data.path) return;
      const url = new URL(e.data.path, window.location.origin);
      const flowParam = url.searchParams.get('flow');
      const stepParam = url.searchParams.get('step');
      const homeCurrency = accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency;
      const regCA2 = getAccountBySubPageType('account')!;
      const style: AccountStyle = accountType === 'business'
        ? { color: regCA2.style.textColor, textColor: regCA2.style.color, iconName: 'Wise' }
        : { color: 'var(--color-interactive-accent)', textColor: 'var(--color-interactive-control)', iconName: 'Wise' };

      if (flowParam) {
        switch (flowParam) {
          case 'send': {
            const previewRecipient = stepParam === 'amount'
              ? accountType === 'business'
                ? { name: 'Acme Corp', subtitle: 'Barclays Bank ending ·· 7821', initials: 'AC', hasFastFlag: false, badgeFlagCode: 'GBP' }
                : { name: 'Christie Davis', subtitle: '@christied25', initials: 'CD', hasFastFlag: true, badgeFlagCode: 'GBP' }
              : undefined;
            setActiveFlow({ type: 'send', defaultCurrency: homeCurrency, accountLabel: 'Current account', accountStyle: style, startStep: (stepParam as 'recipient' | 'amount') ?? 'recipient', recipient: previewRecipient });
            break;
          }
          case 'request': {
            const previewRecipient = stepParam === 'request'
              ? { name: 'Christie Davis', subtitle: '@christied25', initials: 'CD', hasFastFlag: true, badgeFlagCode: 'GBP' }
              : undefined;
            setActiveFlow({ type: 'request', defaultCurrency: homeCurrency, accountLabel: 'Current account', group: undefined, step: stepParam ?? 'recipient', startStep: (stepParam as 'recipient' | 'request') ?? 'recipient', recipient: previewRecipient });
            break;
          }
          case 'convert': setActiveFlow({ type: 'convert', fromCurrency: homeCurrency, toCurrency: 'EUR', accountLabel: 'Current account', accountStyle: style }); break;
          case 'add-money': setActiveFlow({ type: 'add-money', defaultCurrency: homeCurrency, accountLabel: 'Current account', accountStyle: style }); break;
          case 'payment-link': setActiveFlow({ type: 'payment-link', defaultCurrency: homeCurrency, accountLabel: 'Current account' }); break;
          case 'open-plus': setActiveFlow({ type: 'open-plus' }); break;
        }
      } else {
        const state = parseUrl(url.pathname);
        setActiveNavItem(state.navItem);
        setSubPage(state.subPage);
        setActiveFlow(null);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [accountType, businessHomeCurrency, consumerHomeCurrency]);

  const activeName = accountType === 'business' ? businessName : consumerName;
  const activeInitials = getInitials(activeName);
  const personalAvatarUrl = '/avatar-benhur.png';
  const avatarUrl = accountType === 'business' ? '/berry-design-logo.png' : personalAvatarUrl;

  // Account avatar styles — derived from registry (inverted for avatar: bg=textColor, fg=color)
  const registryCurrentAccount = getAccountBySubPageType('account')!;
  const currentAccountStyle: AccountStyle = accountType === 'business'
    ? { color: registryCurrentAccount.style.textColor, textColor: registryCurrentAccount.style.color, iconName: 'Wise' }
    : { color: 'var(--color-interactive-accent)', textColor: 'var(--color-interactive-control)', iconName: 'Wise' };
  const getStyleForSubPage = (subPageType: string): AccountStyle => {
    const def = getAccountBySubPageType(subPageType);
    return def ? def.style : currentAccountStyle;
  };
  function jarStyle(jar: { color: string; iconName: string }): AccountStyle {
    return { color: jar.color, textColor: '#121511', iconName: jar.iconName };
  }

  const handleOpenAddMoney = useCallback((defaultCurrency: string, accountLabel?: string, accountStyle?: AccountStyle) => {
    setActiveFlow({ type: 'add-money', defaultCurrency, accountLabel: accountLabel ?? t('home.currentAccount'), accountStyle: accountStyle ?? currentAccountStyle });
  }, [t, currentAccountStyle]);

  const handleOpenConvert = useCallback((fromCurrency: string, toCurrency: string, accountLabel?: string, group?: string, toAccountLabel?: string, accountStyle?: AccountStyle, toAccountStyle?: AccountStyle, jarId?: string) => {
    setActiveFlow({ type: 'convert', fromCurrency, toCurrency, accountLabel: accountLabel ?? t('home.currentAccount'), toAccountLabel, group, accountStyle: accountStyle ?? currentAccountStyle, toAccountStyle, jarId });
  }, [t, currentAccountStyle]);

  const handleOpenSend = useCallback((defaultCurrency: string, accountLabel?: string, group?: string, recipient?: SendRecipient, prefillAmount?: number, forceClose?: boolean, accountStyle?: AccountStyle) => {
    setActiveFlow({
      type: 'send',
      defaultCurrency,
      accountLabel: accountLabel ?? t('home.currentAccount'),
      group,
      accountStyle: accountStyle ?? currentAccountStyle,
      recipient,
      prefillAmount,
      startStep: recipient ? 'amount' : 'recipient',
      forceClose,
    });
  }, [t, currentAccountStyle]);

  const handleOpenRequest = useCallback((defaultCurrency: string, accountLabel?: string, group?: string, accountStyle?: AccountStyle) => {
    setActiveFlow({ type: 'request', defaultCurrency, accountLabel: accountLabel ?? t('home.currentAccount'), group, accountStyle: accountStyle ?? currentAccountStyle });
  }, [t, currentAccountStyle]);

  const handleOpenPaymentLink = useCallback((defaultCurrency: string, accountLabel?: string, group?: string, accountStyle?: AccountStyle) => {
    setActiveFlow({ type: 'payment-link', defaultCurrency, accountLabel: accountLabel ?? t('home.currentAccount'), group, accountStyle: accountStyle ?? currentAccountStyle });
  }, [t, currentAccountStyle]);

  const handleCloseFlow = useCallback(() => {
    setActiveFlow(null);
  }, []);

  const handleSwitchAccount = useCallback((type: AccountType) => {
    setAccountType(type);
    setActiveNavItem('Home');
    setPreviousNavItem('Home');
    setSubPage(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigate = useCallback((label: string) => {
    setPreviousNavItem(activeNavItem);
    setActiveNavItem(label);
    setSubPage(null);
    document.getElementById('main')?.scrollIntoView({ behavior: 'instant' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeNavItem]);

  const handleAccountClick = () => {
    setPreviousNavItem(activeNavItem);
    setActiveNavItem('Account');
    setSubPage(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleAccountBack = () => {
    setActiveNavItem(previousNavItem);
    setSubPage(null);
  };

  const handleNavigateSubAccount = useCallback(() => {
    setSubPage({ type: 'account' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateCurrencyFromAccount = useCallback((code: string) => {
    setSubPage({ type: 'currency', code, from: 'account' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateGroupAccount = useCallback(() => {
    setSubPage({ type: 'group-account' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateSubAccountByType = useCallback((subPageType: string) => {
    setSubPage({ type: subPageType as any });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateSubAccountCurrency = useCallback((subPageType: string, code: string) => {
    const group = ['group-account', 'shared-spending-account'].includes(subPageType)
      ? subPageType.replace('-account', '')
      : undefined;
    const joint = subPageType === 'joint-account' || undefined;
    const youngExplorer = subPageType === 'young-explorer-account' || undefined;
    setSubPage({ type: 'currency', code, from: subPageType as any, group, joint, youngExplorer });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateGenericCurrencyFromHome = useCallback((subPageType: string, code: string) => {
    const group = ['group-account', 'shared-spending-account'].includes(subPageType)
      ? subPageType.replace('-account', '')
      : undefined;
    const joint = subPageType === 'joint-account' || undefined;
    const youngExplorer = subPageType === 'young-explorer-account' || undefined;
    setSubPage({ type: 'currency', code, from: 'home', group, joint, youngExplorer });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateGenericCurrencyFromAccount = useCallback((subPageType: string, code: string) => {
    const group = ['group-account', 'shared-spending-account'].includes(subPageType)
      ? subPageType.replace('-account', '')
      : undefined;
    const joint = subPageType === 'joint-account' || undefined;
    const youngExplorer = subPageType === 'young-explorer-account' || undefined;
    setSubPage({ type: 'currency', code, from: subPageType as any, group, joint, youngExplorer });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateCurrencyFromGroup = useCallback((code: string) => {
    setSubPage({ type: 'currency', code, from: 'group-account', group: 'group' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateJarAccount = useCallback((jarId: string) => {
    setSubPage({ type: 'jar-account', jarId });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateCurrencyFromJar = useCallback((jarId: string, code: string) => {
    setSubPage({ type: 'currency', code, from: 'jar-account', jarId });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateJarCurrencyFromHome = useCallback((jarId: string, code: string) => {
    setSubPage({ type: 'currency', code, from: 'home', jarId });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateCurrencyFromHome = useCallback((code: string) => {
    setSubPage({ type: 'currency', code, from: 'home' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateAccountDetailsList = useCallback((from: string, accountScope?: string) => {
    setSubPage({ type: 'account-details-list', from, accountScope });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateAccountDetails = useCallback((code: string, from: 'currency' | 'account-details-list' | 'payments', group?: string, listFrom?: string, joint?: boolean, youngExplorer?: boolean) => {
    setSubPage({ type: 'account-details', code, from, group, listFrom, joint, youngExplorer });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleSubPageBack = useCallback(() => {
    if (subPage?.type === 'account-details') {
      if (subPage.from === 'currency') {
        const currencyFrom = subPage.listFrom === 'home' ? 'home' : (subPage.listFrom || 'account');
        setSubPage({ type: 'currency', code: subPage.code, from: currencyFrom as any, group: subPage.group, joint: subPage.joint, youngExplorer: subPage.youngExplorer });
      } else if (subPage.from === 'account-details-list') {
        setSubPage({ type: 'account-details-list', from: subPage.listFrom ?? 'account' });
      } else {
        setSubPage(null);
      }
    } else if (subPage?.type === 'account-details-list') {
      if (subPage.from === 'payments' || subPage.from === 'home') {
        setSubPage(null);
      } else if (subPage.from === 'jar-account' && subPage.accountScope) {
        // jar-account requires jarId param
        setSubPage({ type: 'jar-account', jarId: subPage.accountScope });
      } else {
        // Check if from is a valid account type in the registry
        const account = getAccountBySubPageType(subPage.from);
        if (account) {
          setSubPage({ type: subPage.from } as SubPage);
        } else {
          setSubPage(null);
        }
      }
    } else if (subPage?.type === 'jar-account') {
      setSubPage(null);
    } else if (subPage?.type === 'currency') {
      if (subPage.from === 'home' || !subPage.from) {
        setSubPage(null);
      } else if (subPage.from === 'jar-account' && subPage.jarId) {
        setSubPage({ type: 'jar-account', jarId: subPage.jarId });
      } else {
        setSubPage({ type: subPage.from } as SubPage);
      }
    } else {
      setSubPage(null);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [subPage]);

  const showBack = activeNavItem === 'Account' || ['Transactions', 'Insights'].includes(activeNavItem) || subPage !== null;
  const showBackClass = (activeNavItem === 'Account' || activeNavItem === 'Transactions' || subPage !== null) ? ' column-layout-main--show-back' : '';
  const mobileBackClass = ['Insights'].includes(activeNavItem) && !subPage ? ' column-layout-main--mobile-back' : '';

  const handleBack = () => {
    if (subPage !== null) {
      handleSubPageBack();
    } else if (activeNavItem === 'Account') {
      handleAccountBack();
    } else {
      handleNavigate('Home');
    }
  };

  const sideNavContent = (
    <>
      <div className="nav-sidebar__top">
        <div className="nav-sidebar-brand">
          <a href="/home" onClick={(e) => { e.preventDefault(); setSubPage(null); setActiveNavItem('Home'); }}>
            <Logo />
          </a>
        </div>
      </div>
      <div className="nav-sidebar__body">
        <SideNav items={accountType === 'business' ? businessNav : personalNav} activeItem={subPage ? '' : activeNavItem} onSelect={(label) => { handleNavigate(label); setIsMobileMenuOpen(false); }} />
      </div>
    </>
  );

  const renderContent = () => {
    if (subPage) {
      if (subPage.type === 'jar-account') {
        const jar = getJar(subPage.jarId);
        if (!jar) return <div>Jar not found.</div>;
        const jarName = t(jar.nameKey as any);
        return <AccountPage onNavigateCurrency={(code) => handleNavigateCurrencyFromJar(subPage.jarId, code)} accountType={accountType} jarConfig={jar} personalAvatarUrl={personalAvatarUrl} onAdd={() => handleOpenAddMoney(jar.currencies[0]?.code ?? 'GBP', jarName, jarStyle(jar))} onConvert={() => handleOpenConvert(jar.currencies[0]?.code ?? 'GBP', 'EUR', jarName, undefined, t('home.currentAccount'), jarStyle(jar), currentAccountStyle, jar.id)} onSend={() => handleOpenSend(jar.currencies[0]?.code ?? 'GBP', jarName, undefined, undefined, undefined, undefined, jarStyle(jar))} />;
      }
      {
        const accountDef = getAccountBySubPageType(subPage.type);
        if (accountDef) {
          const acctCurrencies = accountDef.getCurrencies();
          const defaultCode = acctCurrencies[0]?.code ?? 'GBP';
          const secondCode = acctCurrencies[1]?.code ?? acctCurrencies[0]?.code ?? 'GBP';
          const acctLabel = t(accountDef.nameKey as any);
          const acctStyle = accountDef.style;
          const isCurrentAccount = accountDef.subPageType === 'account';
          const group = ['group-account', 'shared-spending-account'].includes(accountDef.subPageType) ? accountDef.subPageType.replace('-account', '') : undefined;
          const features = accountDef.features;
          return (
            <AccountPage
              onNavigateCurrency={(code) => handleNavigateGenericCurrencyFromAccount(accountDef.subPageType, code)}
              onNavigateCards={features.hasCards ? () => handleNavigate('Cards') : undefined}
              onAccountDetails={features.hasAccountDetails ? () => handleNavigateAccountDetailsList(accountDef.subPageType, accountDef.id) : undefined}
              accountType={accountType}
              group={group}
              joint={accountDef.subPageType === 'joint-account' || undefined}
              youngExplorer={accountDef.subPageType === 'young-explorer-account' || undefined}
              personalAvatarUrl={personalAvatarUrl}
              onAdd={() => handleOpenAddMoney(defaultCode, acctLabel, acctStyle)}
              onConvert={features.hasConvert !== false ? () => handleOpenConvert(defaultCode, secondCode, acctLabel, group, isCurrentAccount ? undefined : t('home.currentAccount'), acctStyle, isCurrentAccount ? undefined : currentAccountStyle) : undefined}
              onSend={features.hasSend ? () => handleOpenSend(defaultCode, acctLabel, group, undefined, undefined, undefined, acctStyle) : undefined}
              onRequest={features.hasRequest ? () => handleOpenRequest(defaultCode, acctLabel, group, acctStyle) : undefined}
              onPaymentLink={features.hasPaymentLink ? () => handleOpenPaymentLink(defaultCode, acctLabel, group, acctStyle) : undefined}
            />
          );
        }
      }
      if (subPage.type === 'account-details-list') {
        return <AccountDetailsList accountType={accountType} from={subPage.accountScope || subPage.from} onSelectCurrency={(code) => handleNavigateAccountDetails(code, 'account-details-list', undefined, subPage.accountScope || subPage.from)} />;
      }
      if (subPage.type === 'account-details') {
        return <AccountDetailsPage code={subPage.code} accountType={accountType} subPageType={subPage.listFrom} />;
      }
      if (subPage.type === 'travel-hub') {
        return <TravelHub accountType={accountType} />;
      }
      if (subPage.type === 'currency') {
        const jarDef = subPage.jarId ? getJar(subPage.jarId) : undefined;
        const currencySubPageType = subPage.group === 'shared-spending' ? 'shared-spending-account' : subPage.group ? 'group-account' : subPage.joint ? 'joint-account' : subPage.youngExplorer ? 'young-explorer-account' : 'account';
        const currencyAccountDef = getAccountBySubPageType(currencySubPageType);
        const currencyList = jarDef ? jarDef.currencies : currencyAccountDef?.getCurrencies() ?? activeCurrencies;
        const mainCurrencies = activeCurrencies;
        const sameScopeCurrency = currencyList.find((c) => c.code !== subPage.code)?.code;
        const crossAccountCurrency = mainCurrencies.find((c) => c.code !== subPage.code)?.code;
        const secondCurrency = sameScopeCurrency ?? crossAccountCurrency ?? subPage.code;
        const isCrossAccount = !sameScopeCurrency && !!crossAccountCurrency;
        const isJar = !!jarDef;
        const isCurrentAccount = currencySubPageType === 'account';
        const jarLabel = jarDef ? t(jarDef.nameKey as any) : !isCurrentAccount && currencyAccountDef ? t(currencyAccountDef.nameKey as any) : undefined;
        const convertToLabel = isCrossAccount ? t('home.currentAccount') : undefined;
        const currencyAccountStyle = jarDef ? jarStyle(jarDef) : !isCurrentAccount && currencyAccountDef ? currencyAccountDef.style : undefined;
        const currencyFeatures = currencyAccountDef?.features;
        const onNavigateAccountForCurrency = isJar
          ? () => handleNavigateJarAccount(subPage.jarId!)
          : isCurrentAccount
            ? (subPage.from === 'home' ? () => { setSubPage(null); } : handleNavigateSubAccount)
            : () => handleNavigateSubAccountByType(currencySubPageType);
        const onAccountDetailsForCurrency = isJar || !currencyFeatures?.hasAccountDetails
          ? undefined
          : () => handleNavigateAccountDetails(subPage.code, 'currency', subPage.group, subPage.from === 'home' ? 'home' : currencySubPageType, subPage.joint, subPage.youngExplorer);
        return (
          <CurrencyPage
            code={subPage.code}
            onNavigateAccount={onNavigateAccountForCurrency}
            onAccountDetails={onAccountDetailsForCurrency}
            accountType={accountType}
            group={subPage.group}
            joint={subPage.joint}
            youngExplorer={subPage.youngExplorer}
            jarConfig={jarDef}
            onAdd={() => handleOpenAddMoney(subPage.code, jarLabel, currencyAccountStyle)}
            onConvert={currencyFeatures?.hasConvert !== false ? () => handleOpenConvert(subPage.code, secondCurrency, jarLabel, subPage.group, convertToLabel, currencyAccountStyle, isCrossAccount ? currentAccountStyle : undefined, jarDef?.id) : undefined}
            onSend={currencyFeatures?.hasSend ? () => handleOpenSend(subPage.code, jarLabel, undefined, undefined, undefined, undefined, currencyAccountStyle) : undefined}
            onRequest={currencyFeatures?.hasRequest && !isJar ? () => handleOpenRequest(subPage.code, jarLabel, subPage.group, currencyAccountStyle) : undefined}
            onPaymentLink={currencyFeatures?.hasPaymentLink && !isJar ? () => handleOpenPaymentLink(subPage.code, jarLabel, subPage.group, currencyAccountStyle) : undefined}
          />
        );
      }
    }

    switch (activeNavItem) {
      case 'Account': return <Account onBack={handleAccountBack} accountType={accountType} onSwitchAccount={handleSwitchAccount} avatarUrl={personalAvatarUrl} />;
      case 'Cards': return <Cards accountType={accountType} onTravelHub={() => { setSubPage({ type: 'travel-hub' }); window.scrollTo({ top: 0, behavior: 'instant' }); }} />;
      case 'Transactions': return <Transactions accountType={accountType} />;
      case 'Payments': return <Payments accountType={accountType} personalAvatarUrl={personalAvatarUrl} onSend={() => handleOpenSend(accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency)} onRequest={() => handleOpenRequest(accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency)} onPaymentLink={() => handleOpenPaymentLink(accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency)} onAccountDetails={(code: string) => handleNavigateAccountDetails(code, 'payments')} onAccountDetailsList={(accountId: string) => handleNavigateAccountDetailsList('payments', accountId)} />;
      case 'Recipients': return <Recipients accountType={accountType} personalAvatarUrl={personalAvatarUrl} />;
      case 'Insights': return <Insights accountType={accountType} />;
      case 'Team': return <Team personalAvatarUrl={personalAvatarUrl} />;
      default: return (
        <Home
          onNavigate={handleNavigate}
          onNavigateAccount={handleNavigateSubAccount}
          onNavigateCurrency={handleNavigateCurrencyFromHome}
          onNavigateSubAccount={handleNavigateSubAccountByType}
          onNavigateSubAccountCurrency={handleNavigateGenericCurrencyFromHome}
          onNavigateJarAccount={handleNavigateJarAccount}
          onNavigateJarCurrency={(jarId: string, code: string) => handleNavigateJarCurrencyFromHome(jarId, code)}
          accountType={accountType}
          onAddMoney={() => handleOpenAddMoney(accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency)}
          onSend={() => handleOpenSend(accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency)}
          onSendWithCurrency={(sourceCurrency: string, targetCurrency: string, sourceAmount?: string, targetAmount?: string) => {
            const parseSendAmt = (s?: string) => s ? parseFloat(s.replace(/,/g, '')) || undefined : undefined;
            setActiveFlow({
              type: 'send',
              defaultCurrency: sourceCurrency,
              accountLabel: t('home.currentAccount'),
              accountStyle: currentAccountStyle,
              forcedReceiveCurrency: targetCurrency,
              prefillAmount: parseSendAmt(sourceAmount),
              prefillReceiveAmount: parseSendAmt(targetAmount),
              startStep: 'recipient',
            });
          }}
          onSendAgain={(recipient, amountStr) => {
            const homeCurrency = accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency;
            const parsedCurrency = amountStr ? amountStr.split(' ').pop() ?? homeCurrency : (recipient.badgeFlagCode ?? homeCurrency);
            const parsedAmount = amountStr ? parseFloat(amountStr.replace(/,/g, '')) || undefined : undefined;
            handleOpenSend(parsedCurrency, undefined, undefined, recipient, parsedAmount, true);
          }}
          onRequest={() => handleOpenRequest(accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency)}
          onPaymentLink={() => handleOpenPaymentLink(accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency)}
          onAccountDetails={(subPageType?: string) => handleNavigateAccountDetailsList('home', subPageType)}
          onOpen={() => setActiveFlow({ type: 'open-plus' })}
        />
      );
    }
  };

  if (activeFlow) {
    return (
      <SnackbarProvider>
        {import.meta.env.DEV && <Agentation />}
        <div className="page-layout page-layout--flow">
        {activeFlow.type === 'add-money' && (
          <AddMoneyFlow
            defaultCurrency={activeFlow.defaultCurrency}
            accountLabel={activeFlow.accountLabel}
            accountStyle={activeFlow.accountStyle}
            onClose={handleCloseFlow}
            accountType={accountType}
            avatarUrl={avatarUrl}
            initials={activeInitials}
          />
        )}
        {activeFlow.type === 'convert' && (
          <ConvertFlow
            fromCurrency={activeFlow.fromCurrency}
            toCurrency={activeFlow.toCurrency}
            accountLabel={activeFlow.accountLabel}
            toAccountLabel={activeFlow.toAccountLabel}
            group={activeFlow.group}
            accountStyle={activeFlow.accountStyle}
            toAccountStyle={activeFlow.toAccountStyle}
            jarId={activeFlow.jarId}
            onClose={handleCloseFlow}
            accountType={accountType}
            avatarUrl={avatarUrl}
            initials={activeInitials}
          />
        )}
        {activeFlow.type === 'send' && (
          <SendFlow
            defaultCurrency={activeFlow.defaultCurrency}
            accountLabel={activeFlow.accountLabel}
            group={activeFlow.group}
            accountStyle={activeFlow.accountStyle}
            onClose={handleCloseFlow}
            onStepChange={(step) => setActiveFlow((prev) => prev?.type === 'send' ? { ...prev, step } : prev)}
            accountType={accountType}
            avatarUrl={avatarUrl}
            initials={activeInitials}
            recipient={activeFlow.recipient}
            prefillAmount={activeFlow.prefillAmount}
            prefillReceiveAmount={activeFlow.prefillReceiveAmount}
            startStep={activeFlow.startStep}
            forcedReceiveCurrency={activeFlow.forcedReceiveCurrency}
            forceClose={activeFlow.forceClose}
          />
        )}
        {activeFlow.type === 'request' && (
          <RequestFlow
            defaultCurrency={activeFlow.defaultCurrency}
            accountLabel={activeFlow.accountLabel}
            group={activeFlow.group}
            accountStyle={activeFlow.accountStyle}
            onClose={handleCloseFlow}
            onStepChange={(step) => setActiveFlow((prev) => prev?.type === 'request' ? { ...prev, step } : prev)}
            accountType={accountType}
            avatarUrl={avatarUrl}
            initials={activeInitials}
            startStep={activeFlow.startStep}
            recipient={activeFlow.recipient}
          />
        )}
        {activeFlow.type === 'payment-link' && (
          <PaymentLinkFlow
            defaultCurrency={activeFlow.defaultCurrency}
            accountLabel={activeFlow.accountLabel}
            group={activeFlow.group}
            accountStyle={activeFlow.accountStyle}
            onClose={handleCloseFlow}
            accountType={accountType}
            avatarUrl={avatarUrl}
            initials={activeInitials}
          />
        )}
        {activeFlow.type === 'open-plus' && (
          <OpenPlus
            accountType={accountType}
            onClose={handleCloseFlow}
            avatarUrl={avatarUrl}
            initials={activeInitials}
          />
        )}
        <PrototypeSettings />
        </div>
        {!isGalleryMode && <ScreenGallery accountType={accountType} activeFlowType={(activeFlow as any)?.type} activeFlowStep={activeFlow && 'step' in activeFlow ? (activeFlow as any).step : undefined} />}
      </SnackbarProvider>
    );
  }

  return (
    <SnackbarProvider>
    {!isGalleryMode && <ScreenGallery accountType={accountType} activeFlowType={(activeFlow as any)?.type} activeFlowStep={activeFlow && 'step' in activeFlow ? (activeFlow as any).step : undefined} />}
    <div className="page-layout">
      {import.meta.env.DEV && <Agentation />}
      <div className="column-layout">
        <div className="sidebar-container column-layout-left">
          <div className="nav-sidebar">
            {sideNavContent}
          </div>
        </div>

        <div className={`column-layout-main${showBackClass}${mobileBackClass}`}>
          <TopBar name={activeName} initials={activeInitials} avatarUrl={avatarUrl} onMenuToggle={() => setIsMobileMenuOpen(true)} onAccountClick={handleAccountClick} onOpen={() => setActiveFlow({ type: 'open-plus' })} showBack={showBack} onBack={handleBack} hideAccountSwitcher={activeNavItem === 'Account'} hideOpenButton={activeNavItem !== 'Home' || subPage !== null} />
          <main className="container-content" id="main">
            {renderContent()}
          </main>
        </div>
      </div>

      <SidebarOverlay isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
        <div className="nav-sidebar">
          {sideNavContent}
        </div>
      </SidebarOverlay>

      <MobileNav activeItem={activeNavItem} onSelect={handleNavigate} />
      <PrototypeSettings />
    </div>
    </SnackbarProvider>
  );
}

function App() {
  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: GALLERY_CSS }} />
    <LanguageProvider>
      <DatasetProvider>
        <PrototypeNamesProvider>
          <LiveRatesProvider>
            <ShimmerProvider>
              <AppInner />
            </ShimmerProvider>
          </LiveRatesProvider>
        </PrototypeNamesProvider>
      </DatasetProvider>
    </LanguageProvider>
    </>
  );
}

export default App;
