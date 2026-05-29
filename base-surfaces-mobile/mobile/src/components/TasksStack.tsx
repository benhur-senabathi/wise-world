import { useState, useEffect, type ReactNode } from 'react';
import { ChevronDown } from '@transferwise/icons';
import { useLanguage } from '../context/Language';
import './TasksStack.css';

type Props = {
  children: ReactNode[];
};

export function TasksStack({ children }: Props) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const count = children.length;
  const hasMultiple = count > 1;

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="tasks-stack">
      <div className="d-flex flex-row justify-content-between align-items-center">
        <h3 className="np-text-title-subsection" style={{ margin: 0 }}>{t('tasks.title')}</h3>
        {hasMultiple && (
          <button
            type="button"
            className={`tasks-stack__btn${expanded ? ' tasks-stack__btn--expanded' : ''}`}
            aria-expanded={expanded}
            aria-label={expanded ? `${count} of ${count} tasks are displayed` : `1 of ${count} tasks are displayed`}
            onClick={() => setExpanded(!expanded)}
          >
            <span className="tasks-stack__count">
              {String(count)}
            </span>
            <span className="tasks-stack__chevron">
              <ChevronDown size={16} />
            </span>
          </button>
        )}
      </div>

      <div className="tasks-stack__container" style={{ marginTop: 16 }}>
        <div
          className="tasks-stack__animated"
          style={{
            height: expanded ? `${count * 128}px` : '148px',
          }}
        >
          {hasMultiple && (
            <div
              className="tasks-stack__placeholder"
              style={{
                opacity: expanded ? 0 : (mounted ? 1 : 0),
                transform: expanded
                  ? 'translateY(128px)'
                  : mounted
                    ? 'translateY(16px) scale(0.964)'
                    : 'translateY(0px) scale(0.964)',
              }}
            />
          )}

          <div className="tasks-stack__cards">
            <div className="tasks-stack__first-card" style={{ paddingBottom: 8 }}>
              {children[0]}
            </div>

            {children.slice(1).map((child, i) => (
              <div
                key={i}
                className="tasks-stack__extra-card"
                style={{
                  opacity: expanded ? 1 : 0,
                  transform: expanded ? 'none' : 'translateY(-16px)',
                  pointerEvents: expanded ? 'auto' : 'none',
                }}
              >
                <div style={{ paddingBottom: 8 }}>
                  {child}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
