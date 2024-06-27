import React, { createContext, useContext, useState } from 'react';

import { Asset, Risk } from '@/types';

interface UseModalState {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SelectedAssets {
  selectedAssets: Asset[];
  onSelectedAssetsChange: React.Dispatch<React.SetStateAction<Asset[]>>;
}

interface SelectedRisks {
  selectedRisks: Risk[];
  onSelectedRisksChange: React.Dispatch<React.SetStateAction<Risk[]>>;
}

interface GlobalState {
  modal: {
    seed: UseModalState;
    risk: UseModalState & SelectedAssets;
    asset: UseModalState;
    attribute: UseModalState & SelectedAssets;
    reference: UseModalState & SelectedRisks;
    file: UseModalState;
  };
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [seedOpen, setSeedOpen] = useState(false);
  const [riskOpen, setRiskOpen] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false);
  const [attributeOpen, setAttributeOpen] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [fileOpen, setFileOpen] = useState(false);

  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [selectedRisks, setSelectedRisks] = useState<Risk[]>([]);

  return (
    <GlobalStateContext.Provider
      value={{
        modal: {
          seed: { open: seedOpen, onOpenChange: setSeedOpen },
          risk: {
            open: riskOpen,
            onOpenChange: setRiskOpen,
            selectedAssets,
            onSelectedAssetsChange: setSelectedAssets,
          },
          asset: { open: assetOpen, onOpenChange: setAssetOpen },
          attribute: {
            open: attributeOpen,
            onOpenChange: setAttributeOpen,
            selectedAssets,
            onSelectedAssetsChange: setSelectedAssets,
          },
          reference: {
            open: referenceOpen,
            onOpenChange: setReferenceOpen,
            selectedRisks,
            onSelectedRisksChange: setSelectedRisks,
          },
          file: { open: fileOpen, onOpenChange: setFileOpen },
        },
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};
