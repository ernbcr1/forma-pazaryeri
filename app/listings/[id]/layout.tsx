import ListingSeoInjector from "../../components/ListingSeoInjector";

export default function ListingDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    id: string;
  };
}) {
  return (
    <>
      <ListingSeoInjector listingId={params.id} />
      {children}
    </>
  );
}