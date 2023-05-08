import React from "react";

export interface MainPageLayoutItem {
    key: string;
    icon: (active: boolean) => React.ReactNode;
    title: React.ReactNode;
    route: string;
    htmlTitle?: string;
}

export interface MainPageLayoutTreeItem extends MainPageLayoutItem {
    children?: MainPageLayoutTreeItem[];
}

export interface MainPageTopBarMenuItem {
    key: string;
    route: string;
    icon: React.ReactNode;
    htmlTitle?: string;
}

export type WindowsSystemBtnItem = "minimize" | "maximize" | "close";
