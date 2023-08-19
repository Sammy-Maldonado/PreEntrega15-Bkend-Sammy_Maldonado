class CreateProductDTO {
  constructor(product, user) {
    this.title = product.title,
    this.description = product.description,
    this.price = product.price,
    this.code = product.code,
    this.stock = product.stock,
    this.category = product.category,
    this.thumbnails = product.thumbnails,
    this.owner = user.email
  }
}

class GetProductsDTO {
  constructor(products, totalPages, prevPage, nextPage, page, hasPrevPage, hasNextPage, prevLink, nextLink) {
    this.status = "success";
    this.payload = products;
    this.totalPages = totalPages;
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.page = page;
    this.hasPrevPage = hasPrevPage;
    this.hasNextPage = hasNextPage;
    this.prevLink = prevLink;
    this.nextLink = nextLink;
  }
}

export default {
  CreateProductDTO,
  GetProductsDTO
}