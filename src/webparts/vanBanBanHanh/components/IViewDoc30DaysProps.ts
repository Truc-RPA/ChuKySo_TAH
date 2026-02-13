import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPFI } from '@pnp/sp';

export interface IViewDoc30DaysProps {
  libraryName?: string;
  siteUrl?: string;
  sp: SPFI;
  context: WebPartContext;
  libraryExists?: boolean | Promise<boolean>;
  timeWaiting: number;
  SearchTreeFolder: boolean;
  params: string
}