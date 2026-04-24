import { ListItem } from '@transferwise/components';
import { ChevronRight } from '@transferwise/icons';
import { Flag } from '@wise/art';
import { useLanguage } from '../context/Language';

type Balance = {
  code: string;
  amount: string;
};

type Props = {
  name: string;
  icon: React.ReactNode;
  color: string;
  totalAmount?: string;
  balances: Balance[];
  onNavigateAccount?: () => void;
  onNavigateCurrency?: (code: string) => void;
  balanceHidden?: boolean;
};

export function JarCard({ name, icon, color, totalAmount, balances, onNavigateAccount, onNavigateCurrency, balanceHidden }: Props) {
  const { t } = useLanguage();

  return (
    <article className="mca jar-card">
      <div className="jar-card__header" style={{ backgroundColor: color }}>
        <div className="jar-card__header-content">
          <span className="jar-card__label np-text-body-default-bold">{t('home.jar')}</span>
          <span className="jar-card__icon">{icon}</span>
        </div>
      </div>

      <div className="mca-front jar-card__front">
        <ul className="wds-list list-unstyled m-y-0">
          <ListItem
            title={<h3 className="np-text-title-subsection" style={{ margin: 0 }}>{name}</h3>}
            subtitle={balances.length >= 2 && totalAmount ? <div className="np-text-body-large">{balanceHidden ? '****' : totalAmount}</div> : undefined}
            control={<ListItem.Navigation onClick={() => onNavigateAccount?.()} />}
          />
        </ul>

        <ul className="wds-list list-unstyled m-y-0 mca-balances" aria-label={name}>
          {balances.map(({ code, amount }) => (
            <ListItem
              key={code}
              title={<span className="np-text-body-large">{balanceHidden ? '****' : amount}</span>}
              media={<ListItem.AvatarView size={24}><Flag code={code} loading="eager" /></ListItem.AvatarView>}
              control={<ListItem.Navigation onClick={() => onNavigateCurrency?.(code)} />}
            />
          ))}
        </ul>
      </div>
    </article>
  );
}
