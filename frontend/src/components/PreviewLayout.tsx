import React from 'react';

interface PreviewLayoutProps {
  children: React.ReactNode;
}

const PreviewLayout: React.FC<PreviewLayoutProps> = ({ children }) => {
  // This layout does nothing but render its children.
  // It prevents the default AuthenticatedLayout from redirecting.
  return <>{children}</>;
};

export default PreviewLayout;
