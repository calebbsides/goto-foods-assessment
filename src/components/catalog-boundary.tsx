"use client";

import { Component, type ReactNode } from "react";
import { ErrorState } from "@/components/error-state";

interface CatalogBoundaryProps {
  children: ReactNode;
}

interface CatalogBoundaryState {
  failed: boolean;
}

export class CatalogBoundary extends Component<CatalogBoundaryProps, CatalogBoundaryState> {
  state: CatalogBoundaryState = { failed: false };

  static getDerivedStateFromError(): CatalogBoundaryState {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <ErrorState
          title="Catalog is unavailable"
          message="We could not load the card catalog from the Pokémon TCG API. Refresh to try again."
        />
      );
    }
    return this.props.children;
  }
}
