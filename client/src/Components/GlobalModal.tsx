import { useModal } from "../Context/ModalContext";

export default function GlobalModal() {
  const { isOpen, content, closeModal } = useModal();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center"
      onClick={closeModal}
    >
      <div onClick={(e) => e.stopPropagation()}>
        {content}
      </div>
    </div>
  );
}
