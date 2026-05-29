import React, { useState } from 'react';
import { IconButton } from '@transferwise/components';
import { ChevronDown } from '@transferwise/icons';
import type { NavItem } from '../data/nav';
import { useLanguage } from '../context/Language';
import './SideNav.css';

export function SideNav({ items, activeItem, onSelect }: {
  items: NavItem[];
  activeItem: string;
  onSelect: (label: string) => void;
}) {
  const { t } = useLanguage();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleSubmenu = (label: string) => {
    setExpandedMenus(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <ul className="nav-menu list-unstyled" role="menu">
      {items.map((item) => {
        const isActive = activeItem === item.label ||
          (item.children?.some(child => child.label === activeItem) ?? false);
        const isExpanded = item.children && expandedMenus.has(item.label);

        return (
          <React.Fragment key={item.label}>
            <li className="menu-item" aria-current={isActive ? 'page' : undefined} role="menuitem">
              <a
                className={`generic-menu-item main-menu-item${isActive ? ' active' : ''}${item.children ? ' expandable-item' : ''}`}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.children) {
                    setExpandedMenus(prev => new Set(prev).add(item.label));
                  }
                  onSelect(item.label);
                }}
              >
                <div className="icon-container" role="none">
                  {item.icon}
                </div>
                <span className="menu-item__label"><span>{t(item.translationKey)}</span></span>
              </a>
              {item.children && (
                <span className="generic-menu-item__chevron-button-container">
                  <IconButton
                    size={24}
                    priority="minimal"
                    aria-label={t('sideNav.toggleSubMenu', { label: t(item.translationKey) })}
                    aria-expanded={isExpanded}
                    onClick={() => toggleSubmenu(item.label)}
                  >
                    <span className={`chevron-icon${isExpanded ? ' chevron-icon--expanded' : ''}`}>
                      <ChevronDown size={16} />
                    </span>
                  </IconButton>
                </span>
              )}
            </li>
            {item.children && (
              <li className={`menu-submenu${isExpanded ? ' menu-submenu--open' : ''}`} role="menuitem">
                <ul className="menu-submenu__expandable-container list-unstyled" role="menu">
                  {item.children.map((child) => {
                    const isChildActive = activeItem === child.label;
                    return (
                      <li key={child.label} role="menuitem">
                        <a
                          className={`generic-menu-item${isChildActive ? ' active' : ''}`}
                          href={child.href}
                          onClick={(e) => { e.preventDefault(); onSelect(item.label); }}
                        >
                          <div className="icon-container-small" role="none">
                            {child.icon}
                          </div>
                          <span className="menu-item__label"><span>{t(child.translationKey)}</span></span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </li>
            )}
          </React.Fragment>
        );
      })}
    </ul>
  );
}
