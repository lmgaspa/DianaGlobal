// src/components/ErrorBoundary.tsx
import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Atualiza o estado para que a próxima renderização mostre a interface de fallback.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Você também pode registrar o erro em um serviço de relatórios de erro.
    console.log("Error:", error);
    console.log("ErrorInfo:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer interface de fallback personalizada.
      return <h1>Algo deu errado.</h1>;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
