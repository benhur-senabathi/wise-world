import { ListItem, Header } from '@transferwise/components';
import { Search, Recipients, Link as LinkIcon } from '@transferwise/icons';
import { useLanguage } from '../context/Language';
import './RecipientSearchEmpty.css';

type Props = {
  query: string;
  onPaymentLink?: () => void;
};

export function RecipientSearchEmpty({ query, onPaymentLink }: Props) {
  const { t } = useLanguage();

  return (
    <div className="recipient-search-empty">
      <h2 className="recipient-search-empty__title np-text-title-subsection">
        {t('search.noMatch', { query })}
      </h2>

      <Header title={t('search.tipsTitle')} />

      <ul className="wds-list list-unstyled m-y-0">
        <ListItem
          title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('search.fullDetailsTitle')}</span>}
          subtitle={t('search.fullDetailsDescription')}
          media={
            <ListItem.AvatarView size={48}>
              <Search size={24} />
            </ListItem.AvatarView>
          }
        />
        {onPaymentLink ? (
          <ListItem
            title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('search.requestNewTitle')}</span>}
            subtitle={
              <>
                {t('search.requestNewDescription')}
                <br />
                <button type="button" className="recipient-search-empty__add-link np-text-body-default" style={{ fontWeight: 600 }} onClick={onPaymentLink}>
                  {t('search.createPaymentLink')}
                </button>
              </>
            }
            media={
              <ListItem.AvatarView size={48}>
                <LinkIcon size={24} />
              </ListItem.AvatarView>
            }
          />
        ) : (
          <ListItem
            title={<span className="np-text-body-large" style={{ fontWeight: 600 }}>{t('search.addNewTitle')}</span>}
            subtitle={
              <>
                {t('search.addNewDescription')}
                <br />
                <button type="button" className="recipient-search-empty__add-link np-text-body-default" style={{ fontWeight: 600 }}>
                  {t('search.addRecipient')}
                </button>
              </>
            }
            media={
              <ListItem.AvatarView size={48}>
                <Recipients size={24} />
              </ListItem.AvatarView>
            }
          />
        )}
      </ul>
    </div>
  );
}
