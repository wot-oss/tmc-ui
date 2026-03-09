export function getDeploymentType(baseUrl: string): DeploymentType {
  if (__SERVER_AVAILABLE__) {
    if (__DEBUG__) {
      console.warn('Deployment for a local backend server');
      console.warn('API base URL:', __API_BASE__);
      console.warn('Vite BASE_URL:', baseUrl);
      console.warn('Catalog Url from env:', __CATALOG_URL__);
    }
    return 'SERVER_AVAILABLE';
  } else if (!__CATALOG_URL__) {
    if (__DEBUG__) {
      console.warn(
        'Deployment for a repository that contains a catalog and will clone the default tmc-ui',
      );
      console.warn('Vite BASE_URL:', baseUrl);
      console.warn('Catalog Url from env:', __CATALOG_URL__);
    }
    return 'TYPE_CATALOG-TMC-UI';
  } else {
    if (__DEBUG__) {
      console.warn('Deployment for a tmc-ui that will clone a repository that contains a catalog');
      console.warn('Vite BASE_URL:', baseUrl); // test-tmc-ui/
      console.warn('Catalog Url from env:', __CATALOG_URL__);
    }
    return 'TYPE_TMC-UI-CATALOG';
  }
}
