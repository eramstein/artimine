export const modalStore = {
  visible: false,
  title: '',
  body: '',
  onConfirm: undefined as undefined | (() => void),
  onCancel: undefined as undefined | (() => void),
};
