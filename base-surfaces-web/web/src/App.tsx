import { useState, useCallback, useEffect, useRef } from 'react';
import { Logo, SnackbarProvider } from '@transferwise/components';
import { Agentation } from 'agentation';
import { ScreenGallery, GALLERY_CSS } from './components/ScreenGallery';
import { LanguageProvider, useLanguage } from './context/Language';
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
import { CurrentAccount } from './pages/CurrentAccount';
import { CurrencyPage } from './pages/CurrencyPage';
import { AccountDetailsList } from './pages/AccountDetailsList';
import { AccountDetailsPage } from './pages/AccountDetailsPage';
import { Team } from './pages/Team';
import { AddMoneyFlow } from './flows/AddMoneyFlow';
import { ConvertFlow } from './flows/ConvertFlow';
import { SendFlow } from './flows/SendFlow';
import { RequestFlow } from './flows/RequestFlow';
import { PaymentLinkFlow } from './flows/PaymentLinkFlow';
import { personalNav, businessNav } from './data/nav';
import { currencies } from './data/currencies';
import { businessCurrencies } from './data/business-currencies';
import { groupCurrencies } from './data/taxes-data';
import { getJar, GROUP_IDS, savingsJar, suppliesJar } from './data/jar-data';

export type AccountType = 'personal' | 'business';

type SubPage =
  | { type: 'account' }
  | { type: 'taxes-account' }
  | { type: 'jar-account'; jarId: string }
  | { type: 'currency'; code: string; from?: 'account' | 'home' | 'taxes-account' | 'jar-account'; jar?: 'taxes'; jarId?: string }
  | { type: 'account-details-list'; from: 'account' | 'payments' | 'home' }
  | { type: 'account-details'; code: string; from: 'currency' | 'account-details-list' | 'payments'; jar?: 'taxes'; listFrom?: 'account' | 'payments' }
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

type AccountStyle = { color: string; textColor: string; iconName: string };

type ActiveFlow =
  | { type: 'add-money'; defaultCurrency: string; accountLabel: string; accountStyle: AccountStyle }
  | { type: 'convert'; fromCurrency: string; toCurrency: string; accountLabel: string; toAccountLabel?: string; jar?: 'taxes'; jarId?: string; accountStyle: AccountStyle; toAccountStyle?: AccountStyle }
  | { type: 'send'; defaultCurrency: string; accountLabel: string; jar?: 'taxes'; accountStyle: AccountStyle; recipient?: SendRecipient; prefillAmount?: number; prefillReceiveAmount?: number; startStep?: 'recipient' | 'amount'; forcedReceiveCurrency?: string; step?: string }
  | { type: 'request'; defaultCurrency: string; accountLabel: string; jar?: 'taxes'; step?: string; startStep?: 'recipient' | 'request'; recipient?: SendRecipient }
  | { type: 'payment-link'; defaultCurrency: string; accountLabel: string; jar?: 'taxes' }
  | null;

function flowToPath(flow: ActiveFlow): string | null {
  if (!flow) return null;
  switch (flow.type) {
    case 'send': return `/send/${flow.step ?? 'recipient'}`;
    case 'request': return `/request/${flow.step ?? 'recipient'}`;
    case 'convert': return '/convert';
    case 'add-money': return '/add';
    case 'payment-link': return '/request';
  }
}

// ── URL ↔ State routing helpers ──────────────────────────────────────────────

// Map balanceId → group context for URL resolution
type BalanceOwner = { code: string; from: 'home' | 'taxes-account' | 'jar-account'; jar?: 'taxes'; jarId?: string };
const balanceOwnerMap = new Map<string, BalanceOwner>();
for (const c of currencies) balanceOwnerMap.set(c.balanceId, { code: c.code, from: 'home' });
for (const c of businessCurrencies) balanceOwnerMap.set(c.balanceId, { code: c.code, from: 'home' });
for (const c of groupCurrencies) balanceOwnerMap.set(c.balanceId, { code: c.code, from: 'taxes-account', jar: 'taxes' });
for (const c of savingsJar.currencies) balanceOwnerMap.set(c.balanceId, { code: c.code, from: 'jar-account', jarId: savingsJar.id });
for (const c of suppliesJar.currencies) balanceOwnerMap.set(c.balanceId, { code: c.code, from: 'jar-account', jarId: suppliesJar.id });

function parseUrl(pathname: string): { navItem: string; subPage: SubPage } {
  // /groups/:id (8-digit numeric IDs)
  const groupMatch = pathname.match(/^\/groups\/(\d+)$/);
  if (groupMatch) {
    const id = groupMatch[1];
    if (id === GROUP_IDS.currentAccount) return { navItem: 'Home', subPage: { type: 'account' } };
    if (id === GROUP_IDS.taxes) return { navItem: 'Home', subPage: { type: 'taxes-account' } };
    return { navItem: 'Home', subPage: { type: 'jar-account', jarId: id } };
  }

  // /balances/:balanceId — group context derived from the balanceId itself
  const balanceMatch = pathname.match(/^\/balances\/(\d+)$/);
  if (balanceMatch) {
    const owner = balanceOwnerMap.get(balanceMatch[1]);
    if (owner) {
      return { navItem: 'Home', subPage: { type: 'currency', code: owner.code, from: owner.from, jar: owner.jar, jarId: owner.jarId } };
    }
  }

  // /account-details/:id — if id matches a group ID → list, otherwise → individual balance detail
  const detailsMatch = pathname.match(/^\/account-details\/(\d+)$/);
  if (detailsMatch) {
    const id = detailsMatch[1];
    // Known group ID → account details list for that group
    const allGroupIds = new Set(Object.values(GROUP_IDS));
    if (allGroupIds.has(id as any)) {
      return { navItem: 'Home', subPage: { type: 'account-details-list', from: 'account' } };
    }
    // Balance ID → individual account details page
    const owner = balanceOwnerMap.get(id);
    if (owner) {
      return { navItem: 'Home', subPage: { type: 'account-details', code: owner.code, from: 'account-details-list', jar: owner.jar } };
    }
  }

  // Flow paths — can't reconstruct flow state from URL, so fall through to Home
  if (pathname.startsWith('/send/') || pathname === '/convert' || pathname === '/add' || pathname.startsWith('/request/') || pathname === '/payment-link') {
    return { navItem: 'Home', subPage: null };
  }

  // Top-level nav pages
  switch (pathname) {
    case '/your-account': return { navItem: 'Account', subPage: null };
    case '/cards': return { navItem: 'Cards', subPage: null };
    case '/all-transactions': return { navItem: 'Transactions', subPage: null };
    case '/payments': return { navItem: 'Payments', subPage: null };
    case '/recipients': return { navItem: 'Recipients', subPage: null };
    case '/account-summary': return { navItem: 'Insights', subPage: null };
    case '/team': return { navItem: 'Team', subPage: null };
    default: return { navItem: 'Home', subPage: null };
  }
}

function stateToPath(navItem: string, subPage: SubPage, accountType: AccountType): string {
  if (subPage) {
    switch (subPage.type) {
      case 'account': return `/groups/${GROUP_IDS.currentAccount}`;
      case 'taxes-account': return `/groups/${GROUP_IDS.taxes}`;
      case 'jar-account': return `/groups/${subPage.jarId}`;
      case 'currency': {
        const jarDef = subPage.jarId ? getJar(subPage.jarId) : undefined;
        const currencyList = jarDef ? jarDef.currencies : subPage.jar === 'taxes' ? groupCurrencies : (accountType === 'business' ? businessCurrencies : currencies);
        const currencyData = currencyList.find((c) => c.code === subPage.code);
        return `/balances/${currencyData?.balanceId ?? subPage.code}`;
      }
      case 'account-details-list': return `/account-details/${GROUP_IDS.currentAccount}`;
      case 'account-details': {
        const currencyList = subPage.jar === 'taxes' ? groupCurrencies : (accountType === 'business' ? businessCurrencies : currencies);
        const currencyData = currencyList.find((c) => c.code === subPage.code);
        return `/account-details/${currencyData?.balanceId ?? subPage.code}`;
      }
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

  // Initialise state from the current URL
  const initial = parseUrl(window.location.pathname);
  const params = new URLSearchParams(window.location.search);
  const [activeNavItem, setActiveNavItem] = useState(initial.navItem);
  const [previousNavItem, setPreviousNavItem] = useState('Home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [subPage, setSubPage] = useState<SubPage>(initial.subPage);
  const [accountType, setAccountType] = useState<AccountType>(() => params.get('account') === 'business' ? 'business' : 'personal');
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>(null);

  // Auto-open flow when loaded with ?flow= (gallery preview)
  useEffect(() => {
    if (!isGalleryMode) return;
    const flowParam = params.get('flow');
    if (!flowParam) return;
    const stepParam = params.get('step');
    const homeCurrency = accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency;
    const style: AccountStyle = accountType === 'business'
      ? { color: '#163300', textColor: '#9fe870', iconName: 'Wise' }
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
        setActiveFlow({ type: 'request', defaultCurrency: homeCurrency, accountLabel: 'Current account', jar: undefined, step: stepParam ?? 'recipient', startStep: (stepParam as 'recipient' | 'request') ?? 'recipient', recipient: previewRecipient });
        break;
      }
      case 'convert': setActiveFlow({ type: 'convert', fromCurrency: homeCurrency, toCurrency: 'EUR', accountLabel: 'Current account', accountStyle: style }); break;
      case 'add-money': setActiveFlow({ type: 'add-money', defaultCurrency: homeCurrency, accountLabel: 'Current account', accountStyle: style }); break;
      case 'payment-link': setActiveFlow({ type: 'payment-link', defaultCurrency: homeCurrency, accountLabel: 'Current account' }); break;
    }
  }, []);

  // Sync URL when state changes (skip when handling popstate, skip in gallery mode)
  const isPopstateRef = useRef(false);
  useEffect(() => {
    if (isGalleryMode) return;
    if (isPopstateRef.current) { isPopstateRef.current = false; return; }
    const target = activeFlow ? flowToPath(activeFlow) : stateToPath(activeNavItem, subPage, accountType);
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
      const style: AccountStyle = accountType === 'business'
        ? { color: '#163300', textColor: '#9fe870', iconName: 'Wise' }
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
            setActiveFlow({ type: 'request', defaultCurrency: homeCurrency, accountLabel: 'Current account', jar: undefined, step: stepParam ?? 'recipient', startStep: (stepParam as 'recipient' | 'request') ?? 'recipient', recipient: previewRecipient });
            break;
          }
          case 'convert': setActiveFlow({ type: 'convert', fromCurrency: homeCurrency, toCurrency: 'EUR', accountLabel: 'Current account', accountStyle: style }); break;
          case 'add-money': setActiveFlow({ type: 'add-money', defaultCurrency: homeCurrency, accountLabel: 'Current account', accountStyle: style }); break;
          case 'payment-link': setActiveFlow({ type: 'payment-link', defaultCurrency: homeCurrency, accountLabel: 'Current account' }); break;
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
  const avatarUrl = accountType === 'business' ? '/berry-design-logo.png' : 'https://www.tapback.co/api/avatar/connor-berry.webp';

  // Account avatar styles — single source of truth for all account types
  const currentAccountStyle: AccountStyle = accountType === 'business'
    ? { color: '#163300', textColor: '#9fe870', iconName: 'Wise' }
    : { color: 'var(--color-interactive-accent)', textColor: 'var(--color-interactive-control)', iconName: 'Wise' };
  const taxesGroupStyle: AccountStyle = { color: '#FFEB69', textColor: '#3a341c', iconName: 'Money' };
  function jarStyle(jar: { color: string; iconName: string }): AccountStyle {
    return { color: jar.color, textColor: '#121511', iconName: jar.iconName };
  }

  const handleOpenAddMoney = useCallback((defaultCurrency: string, accountLabel?: string, accountStyle?: AccountStyle) => {
    setActiveFlow({ type: 'add-money', defaultCurrency, accountLabel: accountLabel ?? t('home.currentAccount'), accountStyle: accountStyle ?? currentAccountStyle });
  }, [t, currentAccountStyle]);

  const handleOpenConvert = useCallback((fromCurrency: string, toCurrency: string, accountLabel?: string, jar?: 'taxes', toAccountLabel?: string, accountStyle?: AccountStyle, toAccountStyle?: AccountStyle, jarId?: string) => {
    setActiveFlow({ type: 'convert', fromCurrency, toCurrency, accountLabel: accountLabel ?? t('home.currentAccount'), toAccountLabel, jar, accountStyle: accountStyle ?? currentAccountStyle, toAccountStyle, jarId });
  }, [t, currentAccountStyle]);

  const handleOpenSend = useCallback((defaultCurrency: string, accountLabel?: string, jar?: 'taxes', recipient?: SendRecipient, prefillAmount?: number, accountStyle?: AccountStyle) => {
    setActiveFlow({
      type: 'send',
      defaultCurrency,
      accountLabel: accountLabel ?? t('home.currentAccount'),
      jar,
      accountStyle: accountStyle ?? currentAccountStyle,
      recipient,
      prefillAmount,
      startStep: recipient ? 'amount' : 'recipient',
    });
  }, [t, currentAccountStyle]);

  const handleOpenRequest = useCallback((defaultCurrency: string, accountLabel?: string, jar?: 'taxes') => {
    setActiveFlow({ type: 'request', defaultCurrency, accountLabel: accountLabel ?? t('home.currentAccount'), jar });
  }, [t]);

  const handleOpenPaymentLink = useCallback((defaultCurrency: string, accountLabel?: string, jar?: 'taxes') => {
    setActiveFlow({ type: 'payment-link', defaultCurrency, accountLabel: accountLabel ?? t('home.currentAccount'), jar });
  }, [t]);

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
    setSubPage({ type: 'taxes-account' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateCurrencyFromGroup = useCallback((code: string) => {
    setSubPage({ type: 'currency', code, from: 'taxes-account', jar: 'taxes' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateGroupCurrencyFromHome = useCallback((code: string) => {
    setSubPage({ type: 'currency', code, from: 'home', jar: 'taxes' });
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

  const handleNavigateAccountDetailsList = useCallback((from: 'account' | 'payments' | 'home') => {
    setSubPage({ type: 'account-details-list', from });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleNavigateAccountDetails = useCallback((code: string, from: 'currency' | 'account-details-list' | 'payments', jar?: 'taxes', listFrom?: 'account' | 'payments') => {
    setSubPage({ type: 'account-details', code, from, jar, listFrom });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleSubPageBack = useCallback(() => {
    if (subPage?.type === 'account-details') {
      if (subPage.from === 'currency') {
        const currencyFrom = subPage.listFrom === 'home' ? 'home' : 'account';
        setSubPage({ type: 'currency', code: subPage.code, from: currencyFrom as any, jar: subPage.jar });
      } else if (subPage.from === 'account-details-list') {
        setSubPage({ type: 'account-details-list', from: subPage.listFrom ?? 'account' });
      } else {
        setSubPage(null);
      }
    } else if (subPage?.type === 'account-details-list') {
      if (subPage.from === 'account') {
        setSubPage({ type: 'account' });
      } else if (subPage.from === 'home') {
        setSubPage(null);
      } else {
        setSubPage(null);
      }
    } else if (subPage?.type === 'jar-account') {
      setSubPage(null);
    } else if (subPage?.type === 'currency' && subPage.from === 'account') {
      setSubPage({ type: 'account' });
    } else if (subPage?.type === 'currency' && subPage.from === 'taxes-account') {
      setSubPage({ type: 'taxes-account' });
    } else if (subPage?.type === 'currency' && subPage.from === 'jar-account' && subPage.jarId) {
      setSubPage({ type: 'jar-account', jarId: subPage.jarId });
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
      if (subPage.type === 'account') {
        const activeCurrencies = accountType === 'business' ? businessCurrencies : currencies;
        return <CurrentAccount onNavigateCurrency={handleNavigateCurrencyFromAccount} onNavigateCards={() => handleNavigate('Cards')} onAccountDetails={() => handleNavigateAccountDetailsList('account')} accountType={accountType} onAdd={() => handleOpenAddMoney(activeCurrencies[0]?.code ?? 'GBP')} onConvert={() => handleOpenConvert(activeCurrencies[0]?.code ?? 'GBP', activeCurrencies[1]?.code ?? activeCurrencies[0]?.code ?? 'GBP')} onSend={() => handleOpenSend(activeCurrencies[0]?.code ?? 'GBP')} onRequest={() => handleOpenRequest(activeCurrencies[0]?.code ?? 'GBP')} onPaymentLink={() => handleOpenPaymentLink(activeCurrencies[0]?.code ?? 'GBP')} />;
      }
      if (subPage.type === 'taxes-account') {
        return <CurrentAccount onNavigateCurrency={handleNavigateCurrencyFromGroup} onNavigateCards={() => handleNavigate('Cards')} accountType={accountType} jar="taxes" onAdd={() => handleOpenAddMoney('GBP', t('home.taxes'), taxesGroupStyle)} onConvert={() => handleOpenConvert('GBP', 'EUR', t('home.taxes'), 'taxes', t('home.currentAccount'), taxesGroupStyle, currentAccountStyle)} onSend={() => handleOpenSend('GBP', t('home.taxes'), 'taxes', undefined, undefined, taxesGroupStyle)} onRequest={() => handleOpenRequest('GBP', t('home.taxes'), 'taxes')} onPaymentLink={() => handleOpenPaymentLink('GBP', t('home.taxes'), 'taxes')} />;
      }
      if (subPage.type === 'jar-account') {
        const jar = getJar(subPage.jarId);
        if (!jar) return <div>Jar not found.</div>;
        const jarName = t(jar.nameKey as any);
        return <CurrentAccount onNavigateCurrency={(code) => handleNavigateCurrencyFromJar(subPage.jarId, code)} accountType={accountType} jar={subPage.jarId as any} jarConfig={jar} onAdd={() => handleOpenAddMoney(jar.currencies[0]?.code ?? 'GBP', jarName, jarStyle(jar))} onConvert={() => handleOpenConvert(jar.currencies[0]?.code ?? 'GBP', 'EUR', jarName, undefined, t('home.currentAccount'), jarStyle(jar), currentAccountStyle, jar.id)} onSend={() => handleOpenSend(jar.currencies[0]?.code ?? 'GBP', jarName, undefined, undefined, undefined, jarStyle(jar))} />;
      }
      if (subPage.type === 'account-details-list') {
        const acctCurrencies = accountType === 'business' ? businessCurrencies : currencies;
        return <AccountDetailsList accountType={accountType} onSelectCurrency={(code) => handleNavigateAccountDetails(code, 'account-details-list', undefined, subPage.from)} accountCurrencyCodes={acctCurrencies.map(c => c.code)} />;
      }
      if (subPage.type === 'account-details') {
        return <AccountDetailsPage code={subPage.code} accountType={accountType} />;
      }
      if (subPage.type === 'currency') {
        const jarDef = subPage.jarId ? getJar(subPage.jarId) : undefined;
        const currencyList = jarDef ? jarDef.currencies : subPage.jar === 'taxes' ? groupCurrencies : (accountType === 'business' ? businessCurrencies : currencies);
        const mainCurrencies = accountType === 'business' ? businessCurrencies : currencies;
        const sameScopeCurrency = currencyList.find((c) => c.code !== subPage.code)?.code;
        const crossAccountCurrency = mainCurrencies.find((c) => c.code !== subPage.code)?.code;
        const secondCurrency = sameScopeCurrency ?? crossAccountCurrency ?? subPage.code;
        const isCrossAccount = !sameScopeCurrency && !!crossAccountCurrency;
        const jarLabel = jarDef ? t(jarDef.nameKey as any) : subPage.jar === 'taxes' ? t('home.taxes') : undefined;
        const isJar = !!jarDef;
        const convertToLabel = isCrossAccount ? t('home.currentAccount') : undefined;
        const currencyAccountStyle = jarDef ? jarStyle(jarDef) : subPage.jar === 'taxes' ? taxesGroupStyle : undefined;
        return (
          <CurrencyPage
            code={subPage.code}
            onNavigateAccount={isJar ? () => handleNavigateJarAccount(subPage.jarId!) : subPage.jar === 'taxes' ? handleNavigateGroupAccount : handleNavigateSubAccount}
            onAccountDetails={isJar ? undefined : () => handleNavigateAccountDetails(subPage.code, 'currency', subPage.jar, subPage.from === 'home' ? 'home' : undefined)}
            accountType={accountType}
            jar={subPage.jar}
            jarConfig={jarDef}
            onAdd={() => handleOpenAddMoney(subPage.code, jarLabel, currencyAccountStyle)}
            onConvert={() => handleOpenConvert(subPage.code, secondCurrency, jarLabel, subPage.jar as 'taxes' | undefined, convertToLabel, currencyAccountStyle, isCrossAccount ? currentAccountStyle : undefined, jarDef?.id)}
            onSend={() => handleOpenSend(subPage.code, jarLabel, undefined, undefined, undefined, currencyAccountStyle)}
            onRequest={isJar ? undefined : () => handleOpenRequest(subPage.code, jarLabel, subPage.jar as 'taxes' | undefined)}
            onPaymentLink={isJar ? undefined : () => handleOpenPaymentLink(subPage.code, jarLabel, subPage.jar as 'taxes' | undefined)}
          />
        );
      }
    }

    switch (activeNavItem) {
      case 'Account': return <Account onBack={handleAccountBack} accountType={accountType} onSwitchAccount={handleSwitchAccount} />;
      case 'Cards': return <Cards accountType={accountType} />;
      case 'Transactions': return <Transactions accountType={accountType} />;
      case 'Payments': return <Payments accountType={accountType} onSend={() => handleOpenSend(accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency)} onRequest={() => handleOpenRequest(accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency)} onPaymentLink={() => handleOpenPaymentLink(accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency)} onAccountDetails={(code: string) => handleNavigateAccountDetails(code, 'payments')} onAccountDetailsList={() => handleNavigateAccountDetailsList('payments')} />;
      case 'Recipients': return <Recipients accountType={accountType} />;
      case 'Insights': return <Insights accountType={accountType} />;
      case 'Team': return <Team />;
      default: return (
        <Home
          onNavigate={handleNavigate}
          onNavigateAccount={handleNavigateSubAccount}
          onNavigateCurrency={handleNavigateCurrencyFromHome}
          onNavigateGroupAccount={handleNavigateGroupAccount}
          onNavigateGroupCurrency={handleNavigateGroupCurrencyFromHome}
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
            handleOpenSend(parsedCurrency, undefined, undefined, recipient, parsedAmount);
          }}
          onRequest={() => handleOpenRequest(accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency)}
          onPaymentLink={() => handleOpenPaymentLink(accountType === 'business' ? businessHomeCurrency : consumerHomeCurrency)}
          onAccountDetails={() => handleNavigateAccountDetailsList('home')}
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
          />
        )}
        {activeFlow.type === 'request' && (
          <RequestFlow
            defaultCurrency={activeFlow.defaultCurrency}
            accountLabel={activeFlow.accountLabel}
            jar={activeFlow.jar}
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
            jar={activeFlow.jar}
            onClose={handleCloseFlow}
            accountType={accountType}
            avatarUrl={avatarUrl}
            initials={activeInitials}
          />
        )}
        <PrototypeSettings />
        </div>
        {!isGalleryMode && <ScreenGallery accountType={accountType} activeFlowType={activeFlow?.type} activeFlowStep={activeFlow && 'step' in activeFlow ? activeFlow.step : undefined} />}
      </SnackbarProvider>
    );
  }

  return (
    <SnackbarProvider>
    {!isGalleryMode && <ScreenGallery accountType={accountType} activeFlowType={activeFlow?.type} activeFlowStep={activeFlow && 'step' in activeFlow ? activeFlow.step : undefined} />}
    <div className="page-layout">
      {import.meta.env.DEV && <Agentation />}
      <div className="column-layout">
        <div className="sidebar-container column-layout-left">
          <div className="nav-sidebar">
            {sideNavContent}
          </div>
        </div>

        <div className={`column-layout-main${showBackClass}${mobileBackClass}`}>
          <TopBar name={activeName} initials={activeInitials} avatarUrl={avatarUrl} onMenuToggle={() => setIsMobileMenuOpen(true)} onAccountClick={handleAccountClick} showBack={showBack} onBack={handleBack} hideAccountSwitcher={activeNavItem === 'Account'} hideOpenButton={activeNavItem !== 'Home' || subPage !== null} />
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
      <PrototypeNamesProvider>
        <LiveRatesProvider>
          <ShimmerProvider>
            <AppInner />
          </ShimmerProvider>
        </LiveRatesProvider>
      </PrototypeNamesProvider>
    </LanguageProvider>
    </>
  );
}

export default App;
