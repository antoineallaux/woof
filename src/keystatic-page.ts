// Composant Admin Keystatic pré-configuré (importé par la page /keystatic)
import { makePage } from '@keystatic/astro/ui';
import config from '../keystatic.config';

export const Keystatic = makePage(config);
