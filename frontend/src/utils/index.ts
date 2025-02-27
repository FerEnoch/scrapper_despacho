// import { UserSession } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: string) {
  let statusColor;
  switch (status) {
    case "EN CURSO":
      statusColor = "text-green-700";
      break;
    case "FINALIZADO":
      statusColor = "text-red-700";
      break;
    case "SISTEMA ANTERIOR":
      statusColor = "text-yellow-600";
      break;
    default:
      statusColor = "text-gray-500";
  }
  return statusColor;
}

export function getMessageColor(message: string) {
  let messageColor;
  switch (message) {
    case "Operación Finalizada":
      messageColor = "text-green-700";
      break;
    case "ERROR":
      messageColor = "text-red-700";
      break;
    default:
      messageColor = "text-gray-500";
  }
  return messageColor;
}