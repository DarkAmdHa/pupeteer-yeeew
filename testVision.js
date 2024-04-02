function main(parent) {
  // [START vision_v1p4beta1_generated_ProductSearch_ListProducts_async]
  /**
   * This snippet has been automatically generated and should be regarded as a code template only.
   * It will require modifications to work.
   * It may require correct/in-range values for request initialization.
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  Required. The project OR ProductSet from which Products should be listed.
   *  Format:
   *  `projects/PROJECT_ID/locations/LOC_ID`
   */
  // const parent = 'abc123'
  /**
   *  The maximum number of items to return. Default 10, maximum 100.
   */
  // const pageSize = 1234
  /**
   *  The next_page_token returned from a previous List request, if any.
   */
  // const pageToken = 'abc123'

  // Imports the Vision library
  const { ProductSearchClient } = require("@google-cloud/vision").v1p4beta1;

  // Instantiates a client
  const visionClient = new ProductSearchClient();

  async function callListProducts() {
    // Construct request
    const request = {
      parent,
    };

    // Run request
    const iterable = await visionClient.listProductsAsync(request);
    for await (const response of iterable) {
      console.log(response);
    }
  }

  callListProducts();
  // [END vision_v1p4beta1_generated_ProductSearch_ListProducts_async]
}

process.on("unhandledRejection", (err) => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
