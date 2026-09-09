export const dynamic = "force-dynamic";
const deny = () => new Response(null, { status: 404 });
export { deny as GET, deny as POST, deny as PUT, deny as PATCH, deny as DELETE, deny as HEAD, deny as OPTIONS };
