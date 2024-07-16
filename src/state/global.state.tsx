import React, { createContext, useContext, useState } from 'react';

interface UseModalState {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SelectedAssets {
  selectedAssets: string[];
  onSelectedAssetsChange: React.Dispatch<React.SetStateAction<string[]>>;
}

interface GlobalState {
  modal: {
    seed: UseModalState;
    risk: UseModalState & SelectedAssets;
    asset: UseModalState;
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
  const [fileOpen, setFileOpen] = useState(false);

  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

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
          file: { open: fileOpen, onOpenChange: setFileOpen },
        },
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};
