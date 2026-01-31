import React, { createContext, KeyboardEvent, ReactNode, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from '@inertiajs/react';
import { RootState } from '../../../slices/reducer';
import { LAYOUT_TYPES, SIDEBAR_SIZE } from '../../Constants/layout';
export type DropdownPosition = "" | "right" | "top-right" | "top-left";
let openDropdowns: any = [];

interface DropdownProps {
  position?: DropdownPosition;
  trigger?: "click" | "hover";
  children: ReactNode;
  dropdownClassName?: string;
  closeOnOutsideClick?: boolean;
  closeOnOutsideClickSidebar?: boolean;
  isActive ?: boolean | null;
  /** Accessible label for the dropdown menu */
  ariaLabel?: string;
}

interface DropdownContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  position: string;
  trigger: string;
  close: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
  calculatePosition: () => void;
  menuId: string;
  buttonId: string;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
}

const DropdownContext = createContext<DropdownContextProps | undefined>(
  undefined,
);

const Dropdown: React.FC<DropdownProps> = ({
  position = "bottom",
  trigger = "click",
  children,
  dropdownClassName,
  isActive,
  closeOnOutsideClick = true,
  closeOnOutsideClickSidebar = true,
  ariaLabel,
}) => {
  const { layoutType, layoutSidebar } = useSelector(
    (state: RootState) => state.Layout,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const baseId = useId();
  const menuId = `${baseId}-menu`;
  const buttonId = `${baseId}-button`;

  const handleToggle = useCallback(
    () => {
      // if horizontall
      if (
        layoutType === LAYOUT_TYPES.HORIZONTAL ||
        layoutSidebar === SIDEBAR_SIZE.SMALL
      ) {
        if (!dropdownRef?.current?.closest(".dropdown-menu"))
          openDropdowns = [];

        openDropdowns.push(dropdownRef);
        let count = 0;
        if (openDropdowns.length > 2) {
          openDropdowns = openDropdowns.filter((item: any) => {
            count++;
            if (count === 2) {
              item.current.click();
              return false; // Remove this item from the array
            }
            return true; // Keep the rest
          });
        }
      }

      if (trigger === "click") {
        setIsOpen((prev) => {
          if (!prev) {
            // Opening - reset focus index
            setFocusedIndex(-1);
          }
          return !prev;
        });
      }
    },
    [trigger, layoutType, layoutSidebar],
  );

  const handleMouseEnter = useCallback(() => {
    if (trigger === "hover") {
      setIsOpen(true);
    }
  }, [trigger]);

  const handleMouseLeave = useCallback(() => {
    if (trigger === "hover") {
      setIsOpen(false);
    }
  }, [trigger]);

  // Get all menu items for keyboard navigation
  const getMenuItems = useCallback(() => {
    if (!menuRef.current) return [];
    return Array.from(menuRef.current.querySelectorAll<HTMLElement>(
      '[role="menuitem"], .dropdown-item'
    ));
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const menuItems = getMenuItems();

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        // Return focus to the trigger button
        const button = document.getElementById(buttonId);
        button?.focus();
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          const newIndex = focusedIndex < menuItems.length - 1 ? focusedIndex + 1 : 0;
          setFocusedIndex(newIndex);
          menuItems[newIndex]?.focus();
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          const newIndex = focusedIndex > 0 ? focusedIndex - 1 : menuItems.length - 1;
          setFocusedIndex(newIndex);
          menuItems[newIndex]?.focus();
        }
        break;

      case 'Home':
        event.preventDefault();
        if (isOpen && menuItems.length > 0) {
          setFocusedIndex(0);
          menuItems[0]?.focus();
        }
        break;

      case 'End':
        event.preventDefault();
        if (isOpen && menuItems.length > 0) {
          const lastIndex = menuItems.length - 1;
          setFocusedIndex(lastIndex);
          menuItems[lastIndex]?.focus();
        }
        break;

      case 'Tab':
        // Close dropdown and allow normal tab behavior
        if (isOpen) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;
    }
  }, [isOpen, focusedIndex, getMenuItems, buttonId]);

  const handleClickOutside = (event: any) => {
    if (
      closeOnOutsideClick &&
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target)
    ) {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  const handleClickOutsideSidebar = (event: any) => {
    const sidebar = document.querySelector("#main-sidebar");

    if (
      closeOnOutsideClickSidebar &&
      sidebar &&
      sidebar.contains(event.target) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target)
    ) {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutsideSidebar);
    return () => {
      document.removeEventListener("click", handleClickOutsideSidebar);
    };
  }, []);

  // Focus first menu item when menu opens
  useEffect(() => {
    if (isOpen && focusedIndex === -1) {
      const menuItems = getMenuItems();
      if (menuItems.length > 0) {
        // Small delay to ensure menu is rendered
        setTimeout(() => {
          setFocusedIndex(0);
          menuItems[0]?.focus();
        }, 50);
      }
    }
  }, [isOpen, focusedIndex, getMenuItems]);

  //function
  const getDefault = (buttonRect: DOMRect, dropdown: HTMLElement) => {
    const data = { left: 0, top: 0 };
    const dropdownWidth = dropdown.offsetWidth;
    const dropdownHeight = dropdown.offsetHeight;

    const yTSpace = buttonRect.top;
    const yBSpace = window.innerHeight - buttonRect.bottom;
    const xRSpace = window.innerWidth - buttonRect.left;
    const xLSpace = buttonRect.left;
    data.left =
      xRSpace >= dropdownWidth
        ? buttonRect.left
        : buttonRect.right - dropdownWidth;

    if (yBSpace >= dropdownHeight) {
      data.top = buttonRect.bottom;
    } else if (yTSpace >= dropdownHeight) {
      data.top = buttonRect.top - dropdown.offsetHeight;
    } else {
      data.top = buttonRect.top;
      if (xRSpace >= dropdownWidth) {
        data.left = buttonRect.right;
      } else if (xLSpace >= dropdownWidth) {
        data.left = buttonRect.left - dropdown.offsetWidth;
      } else {
        data.left = buttonRect.right;
      }
    }
    return data;
  };

  const getRight = (buttonRect: DOMRect, dropdown: HTMLElement) => {
    const data = { left: 0, top: 0 };
    const dropdownWidth = dropdown.offsetWidth;
    const dropdownHeight = dropdown.offsetHeight;

    const yTSpace = buttonRect.top;
    const yBSpace = window.innerHeight - buttonRect.bottom;
    const xLSpace = buttonRect.right;
    data.left =
      xLSpace < dropdownWidth
        ? buttonRect.left
        : buttonRect.right - dropdownWidth;

    if (yBSpace >= dropdownHeight) {
      data.top = buttonRect.bottom;
    } else if (yTSpace >= dropdownHeight) {
      data.top = buttonRect.top - dropdown.offsetHeight;
    } else {
      data.top = buttonRect.top;
      if (xLSpace - buttonRect.width > dropdownWidth) {
        data.left = buttonRect.left - dropdown.offsetWidth;
      } else {
        data.left = buttonRect.right;
      }
    }
    return data;
  };

  const getTopRight = (buttonRect: DOMRect, dropdown: HTMLElement) => {
    const data = { left: 0, top: 0 };
    const dropdownWidth = dropdown.offsetWidth;
    const dropdownHeight = dropdown.offsetHeight;

    const yTSpace = buttonRect.bottom;
    const yBSpace = window.innerHeight - buttonRect.top;
    const xRSpace = window.innerWidth - buttonRect.right;
    const xLSpace = buttonRect.left;

    if (yBSpace >= dropdownHeight) {
      data.top = buttonRect.top;
    } else if (yTSpace >= dropdownHeight) {
      data.top = buttonRect.bottom - dropdown.offsetHeight;
    } else {
      data.top = buttonRect.top;
    }
    if (xRSpace >= dropdownWidth) {
      data.left = buttonRect.right;
    } else if (xLSpace >= dropdownWidth) {
      data.left = buttonRect.left - dropdown.offsetWidth;
    } else {
      data.left = buttonRect.right;
    }

    return data;
  };

  const getRightLeft = (buttonRect: DOMRect, dropdown: HTMLElement) => {
    const data = {
      left: 0,
      top: 0,
    };
    if (buttonRect.x - dropdown.offsetWidth < 0) {
      data.top = buttonRect.bottom;
      data.left = buttonRect.left;
    }
    if (window.innerHeight < buttonRect.top + dropdown.offsetHeight) {
      data.top = buttonRect.top - dropdown.offsetHeight;
      data.left = buttonRect.left;
    }
    return data;
  };

  useEffect(() => {
    if (position === "top-right" || position === "right") {
      setIsOpen(isActive ?? false);
    } else {
      setIsOpen(false);
    }
  }, [position, trigger, isActive]);

  const calculatePosition = useCallback(() => {
    if (!dropdownRef.current || !menuRef.current) {
      return;
    }

    const buttonRect =
      dropdownRef.current.getBoundingClientRect() ||
      dropdownRef.current.closest(".dropdown")?.getBoundingClientRect();
    let dropdownPosition = { left: 0, top: 0 };
    switch (position) {
      case "right":
        dropdownPosition = getRight(buttonRect, menuRef.current);
        break;
      case "top-right":
        dropdownPosition = getTopRight(buttonRect, menuRef.current);
        break;
      case "top-left":
        dropdownPosition = getRightLeft(buttonRect, menuRef.current);
        break;
      default:
        dropdownPosition = getDefault(buttonRect, menuRef.current);
        break;
    }

    menuRef.current.style.left = `${Math.max(0, dropdownPosition.left)}px`;
    menuRef.current.style.top = `${Math.max(0, dropdownPosition.top)}px`;
  }, [position]);

  useEffect(() => {
    calculatePosition();
  }, [isOpen, calculatePosition]);

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  return (
    <DropdownContext.Provider
      value={{
        isOpen,
        setIsOpen,
        position,
        trigger,
        close,
        menuRef,
        calculatePosition,
        menuId,
        buttonId,
        focusedIndex,
        setFocusedIndex,
      }}
    >
      <div
        ref={dropdownRef}
        className={`${dropdownClassName}`}
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

interface DropdownButtonProps {
  children: React.ReactNode;
  colorClass?: string;
  arrow?: boolean;
  isActive?: boolean;
  /** Accessible label for the dropdown button */
  ariaLabel?: string;
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
  children,
  colorClass,
  arrow,
  ariaLabel,
}) => {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error("DropdownButton must be used within a Dropdown");
  }

  const { isOpen, menuId, buttonId } = context;

  return (
    <button
      id={buttonId}
      className={`${colorClass}`}
      type="button"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={isOpen ? menuId : undefined}
      aria-label={ariaLabel}
    >
      {children}
      {arrow && (
        <svg
          className={`size-5 arrow ${isOpen ? "transform rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
};

interface DropdownMenuProps {
  children: React.ReactNode;
  menuclass?: string;
  handleMenuClick?: (event: React.MouseEvent) => void;
  /** Accessible label for the menu */
  ariaLabel?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  menuclass,
  handleMenuClick,
  ariaLabel,
}) => {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error("DropdownMenu must be used within a Dropdown");
  }

  const { isOpen, menuRef, menuId, buttonId } = context;

  return (
    isOpen && (
      <div
        id={menuId}
        ref={menuRef}
        className={`dropdown-menu ${menuclass}`}
        style={{ transition: "opacity 0.2s" }}
        onClick={handleMenuClick}
        role="menu"
        aria-labelledby={buttonId}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    )
  );
};

interface DropdownItemProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  href,
  className,
  onClick,
}) => {
  const context = useContext(DropdownContext);

  const handleClick = useCallback(() => {
    onClick?.();
    context?.close();
  }, [onClick, context]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <li role="presentation">
      <Link
        href={href || "#"}
        className={`dropdown-item ${className || ''}`}
        role="menuitem"
        tabIndex={-1}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {children}
      </Link>
    </li>
  );
};

export {
  Dropdown,
  DropdownButton, DropdownContext, DropdownItem, DropdownMenu
};
