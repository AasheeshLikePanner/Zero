import { useActiveConnection, useConnections } from '@/hooks/use-connections';
import { LabelSidebarContextMenu } from '../context/label-sidebar-context';
import { useSearchValue } from '@/hooks/use-search-value';
import { useSidebar } from '../context/sidebar-context';
import type { Label as LabelType } from '@/types';
import { Folder } from '../magicui/file-tree';
import { useNavigate } from 'react-router';
import { useCallback } from 'react';
import * as React from 'react';

export const RecursiveFolder = ({ label, activeAccount, count }: { label: any; activeAccount?: any; count?: number }) => {
  const [searchValue, setSearchValue] = useSearchValue();
  const isActive = searchValue.value.includes(`label:${label.name}`);
  const isFolderActive = isActive || window.location.pathname.includes(`/mail/label/${label.id}`);
  const navigate = useNavigate();
  const { data: connections } = useConnections();
  const { data: activeConnection } = useActiveConnection();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleFilterByLabel = useCallback(
    (labelToFilter: LabelType) => {
      const existingValue = searchValue.value;
      if (existingValue.includes(`label:${labelToFilter.name}`)) {
        setSearchValue({
          value: existingValue.replace(`label:${labelToFilter.name}`, '').trim(),
          highlight: '',
          folder: '',
        });
        return;
      }
      const newValue = existingValue
        ? `${existingValue} label:${labelToFilter.name}`
        : `label:${labelToFilter.name}`;
      setSearchValue({
        value: newValue,
        highlight: '',
        folder: '',
      });
    },
    [searchValue, setSearchValue],
  );

  const handleFolderClick = useCallback(
    (id: string) => {
      if (!activeAccount) return;

      if (id.startsWith('group-')) {
        return;
      }

      const labelToUse = label.originalLabel || label;

      if (activeAccount.providerId === 'microsoft') {
        navigate(`/mail/${id}`);
      } else {
        handleFilterByLabel(labelToUse);
      }

      if (isMobile) {
        setOpenMobile(false);
      }
    },
    [navigate, handleFilterByLabel, activeAccount, label, isMobile, setOpenMobile],
  );

  const hasChildren = label.labels && label.labels.length > 0;

  return (
    <LabelSidebarContextMenu
      labelId={label.id}
      key={label.id}
      hide={activeAccount?.providerId === 'microsoft' || hasChildren}
    >
      <Folder
        element={label.name}
        value={label.id}
        key={label.id}
        hasChildren={hasChildren}
        onFolderClick={handleFolderClick}
        isSelect={isFolderActive}
        count={count}
      >
        {label.labels?.map((childLabel: any) => (
          <RecursiveFolder key={childLabel.id} label={childLabel} count={count} />
        ))}
      </Folder>
    </LabelSidebarContextMenu>
  );
};
