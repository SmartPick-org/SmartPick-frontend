/**
 * SmartPick UI Design System Constants
 * 
 * These values define the "Golden Ratios" of the application.
 * Change these values only when a fundamental design overhaul is required.
 */

export const UI_CONSTANTS = {
    // Results Page Layout
    RESULTS: {
        SIDEBAR_WIDTH: 100, // px
        SIDEBAR_INDICATOR_HEIGHT: 40, // px
        ROW_HEIGHT: 64, // px

        // Vertical flow calculation: 
        // Card Padding(40) + Badge(28) + Gap(12) + Title(32) + Gap(4) + Subtitle(32) + Gap(18) + Benefit(80) 
        // + Track Padding Top(40) = 286px
        HEADER_OFFSET: 286,

        CARD: {
            WIDTH: 320, // px
            GAP: 40, // gap-10 = 40px
            BORDER_RADIUS: 32, // px
            PADDING_X: 24, // px
            PADDING_Y: 40, // px
            BENEFIT_AREA_HEIGHT: 80, // px
        },

        FONT: {
            SIDEBAR_LABEL: "13px",
            CARD_CATEGORY_LABEL: "15px",
            CARD_TITLE: "22px",
            CARD_BENEFIT_BIG: "32px",
        }
    }
};
