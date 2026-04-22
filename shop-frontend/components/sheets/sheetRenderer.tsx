import AddProductDrawer from "../../../app/(POS)/pos/components/AddProductDrawer";
import CartSheet from "../../../app/(POS)/pos/components/CartSheet";


export default function SheetRenderer({
  sheet,
  close,
}: {
  sheet: string | null;
  close: () => void;
}) {
  if (!sheet) return null;

  return (
    <div className="fixed inset-0 z-[100]">

      {/* BACKDROP */}
      <div
        onClick={close}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* SHEET */}
      <div className="absolute bottom-0 left-0 right-0 animate-sheet-up">
        {sheet === "cart" && <CartSheet />}
        {sheet === "addProduct" && <AddProductDrawer />}
      </div>
    </div>
  );
}