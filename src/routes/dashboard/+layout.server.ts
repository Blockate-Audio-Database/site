import { USER_PERMISSIONS } from "$lib/config/config";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
	return locals.user
};