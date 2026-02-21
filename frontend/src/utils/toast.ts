import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const success = (message: string) => toast.success(message);
export const error = (message: string) => toast.error(message);
export const info = (message: string) => toast.info(message);
export const warning = (message: string) => toast.warning(message);
