const BASE_URL = "https://lagoapparel-development.nodejs.p80w.com/";

export const API = {
  puchaseOrder: BASE_URL + "purchase-orders",
  orderPreviews: BASE_URL + "order-previews",
  puchaseOrderSearch: BASE_URL + "purchase-orders/search",
  puchaseOrderInstructions: BASE_URL + "order-instructions",
  customers: BASE_URL + "customers",
  customersAll: BASE_URL + "customers-all",
  customerList: BASE_URL + "customer-list",
  products: BASE_URL + "products",
  customerArtwork: BASE_URL + "customer-artwork",
  publicArtwork: BASE_URL + "public-artwork",
  allArtworks: BASE_URL + "all-artwork",
  imageEncode: BASE_URL + "image-encode",
  artwork: BASE_URL + "artwork",
  artworkBulkUpload: BASE_URL + "artwork-upload",
  typesAndVendors: BASE_URL + "products-types-and-vendors",
  orderComments: BASE_URL + "order-comments",
  addSalesReps: BASE_URL + "add-sales-reps",
  salesReps: BASE_URL + "sales-reps",
  sendCheckoutURL: BASE_URL + "send-checkout-url",
  adminApproveOrder:BASE_URL + 'admin-approve-order',
  customerLogin:BASE_URL + 'login'
};
