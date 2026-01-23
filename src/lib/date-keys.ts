import { format, parse } from "date-fns";

export function toDateKey(date: Date) {
	return format(date, "yyyy-MM-dd");
}

export function fromDateKey(value: string) {
	return parse(value, "yyyy-MM-dd", new Date());
}
