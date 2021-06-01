import React from "react";

export interface MainPageLayoutItem {
    key: string;
    icon: (active: boolean) => React.ReactNode;
    title: React.ReactNode;
    route: string;
}
