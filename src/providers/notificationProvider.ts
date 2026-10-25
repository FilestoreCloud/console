import { NotificationProvider } from "@refinedev/core";
import { toast } from "sonner";

export const notificationProvider: NotificationProvider = {
  open: ({ message, description, type }) => {
    switch (type) {
      case "success":
        toast.success(message, { description });
        break;
      case "error":
        toast.error(message, { description });
        break;
      case "progress":
        toast.loading(message, { description });
        break;
      default:
        toast(message, { description });
        break;
    }
  },
  close: (key) => {
    if (key) {
      toast.dismiss(key);
    } else {
      toast.dismiss();
    }
  },
};
