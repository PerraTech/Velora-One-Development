import type { LucideIcon } from "lucide-react";
import type { StaticImageData } from "next/image";
import { LayoutDashboard, Tablet, Smartphone, PanelsTopLeft, Droplets, Wind, BatteryCharging } from "lucide-react";
import connectImage from "../../public/images/connect-concept.jpeg";
import tabletImage from "../../public/images/tablet-concept.jpeg";
import housekeepingImage from "../../public/images/housekeeping-concept.jpeg";
import wallPanelImage from "../../public/images/wall-panel-concept.jpeg";
import airImage from "../../public/images/air-concept.jpeg";
import dockImage from "../../public/images/dock-concept.jpeg";

export const moduleStatuses = {
  planned: "Gepland",
  "in-development": "In ontwikkeling",
  preview: "Preview beschikbaar",
  completed: "Gereed",
} as const;

export type ModuleStatus = keyof typeof moduleStatuses;
export type ModuleImage = { src: StaticImageData; alt: string };
export type PortalModule = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ModuleStatus;
  images: readonly [ModuleImage, ...ModuleImage[]];
  features: readonly string[];
  icon: LucideIcon;
  // Alleen expliciete, geïmplementeerde pagina's onder /previews/ zijn previews.
  // De informatiepagina /portal/[id] is nooit een frontend-preview.
  previewPath?: `/previews/${string}`;
};

export const modules: readonly PortalModule[] = [
  {
    id: "manager-dashboard", title: "Manager Dashboard", category: "Management", status: "planned",
    description: "Overzicht van hoteloperaties en inzichten voor het management.", icon: LayoutDashboard,
    images: [{ src: connectImage, alt: "VELORA CONNECT conceptreferentie voor het managementoverzicht" }],
    features: ["Hoteloperaties in één overzicht", "Inzichten voor het management"],
  },
  {
    id: "velora-one", title: "VELORA ONE Tablet", category: "Housekeeping", status: "preview",
    previewPath: "/previews/velora-one",
    description: "Tabletwerkplek voor kamers, taken en voorraad op de housekeeping-trolley.", icon: Tablet,
    images: [{ src: tabletImage, alt: "Conceptbeeld van de VELORA ONE tabletwerkplek" }],
    features: ["Overzicht van kamers", "Taken raadplegen op de tablet", "Voorraadoverzicht"],
  },
  {
    id: "housekeeping", title: "Housekeeping App", category: "Housekeeping", status: "planned",
    description: "Overzicht van kamers en dagelijkse taken voor het housekeepingteam.", icon: Smartphone,
    images: [{ src: housekeepingImage, alt: "Conceptreferentie van de Housekeeping App" }],
    features: ["Kameroverzicht voor het team", "Overzicht van dagelijkse taken"],
  },
  {
    id: "guest-wall-panel", title: "Guest Wall Panel", category: "Guest experience", status: "planned",
    description: "Wandpaneel voor toegang tot gastservice vanuit de hotelkamer.", icon: PanelsTopLeft,
    images: [{ src: wallPanelImage, alt: "Conceptbeeld van het VELORA Guest Wall Panel" }],
    features: ["Bediening via een wandpaneel", "Toegang tot gastservice"],
  },
  {
    id: "smart-dispensers", title: "Smart Dispensers", category: "Connected hardware", status: "planned",
    description: "Inzicht in verbruik en voorraad van dispensers in de hotelbadkamer.", icon: Droplets,
    images: [{ src: connectImage, alt: "Gedeelde VELORA CONNECT conceptreferentie; geen afzonderlijke dispenserafbeelding" }],
    features: ["Inzicht in verbruik", "Overzicht van voorraad"],
  },
  {
    id: "velora-air", title: "VELORA AIR", category: "Connected hardware", status: "planned",
    description: "Concept voor geurverspreiding in hotelruimtes.", icon: Wind,
    images: [{ src: airImage, alt: "Conceptbeeld van VELORA AIR" }],
    features: ["Geurverspreiding in hotelruimtes"],
  },
  {
    id: "velora-dock", title: "VELORA DOCK", category: "Connected hardware", status: "planned",
    description: "Dock voor het plaatsen en opladen van de VELORA ONE tablet.", icon: BatteryCharging,
    images: [{ src: dockImage, alt: "Conceptbeeld van het VELORA DOCK" }],
    features: ["Vaste plek voor de VELORA ONE tablet", "Tablet opladen"],
  },
];
