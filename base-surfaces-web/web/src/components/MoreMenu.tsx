import { useState, useRef, useEffect } from 'react';
import { IconButton } from '@transferwise/components';
import { More } from '@transferwise/icons';
import './MoreMenu.css';

type MenuItem = {
  label: string;
  onClick?: () => void;
};

type Props = {
  items: MenuItem[];
};

export function MoreMenu({ items }: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="more-menu" ref={menuRef}>
      <IconButton
        aria-label="More options"
        size={32}
        priority="tertiary"
        onClick={() => setOpen(!open)}
      >
        <More size={16} />
      </IconButton>
      {open && (
        <div className="more-menu__dropdown">
          <ul className="more-menu__list">
            {items.map((item, i) => (
              <li key={i}>
                <button
                  className="more-menu__item"
                  onClick={() => { item.onClick?.(); setOpen(false); }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
