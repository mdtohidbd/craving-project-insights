export const generateSlug = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-");
