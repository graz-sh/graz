export default {
  projectLink: "https://github.com/strangelove-ventures/graz", // GitHub link in the navbar
  docsRepositoryBase: "https://github.com/strangelove-ventures/graz/blob/dev/docs/pages/", // base URL for the docs repository
  titleSuffix: " – graz",
  nextLinks: true,
  prevLinks: true,
  search: true,
  customSearch: null,
  footer: true,
  footerText: (
    <a href="https://github.com/strangelove-ventures/graz/blob/dev/LICENSE">
      MIT License, Copyright © {new Date().getFullYear()} Strangelove Ventures
    </a>
  ),
  footerEditLink: `Edit this page on GitHub`,
  logo: (
    <>
      <span className="mr-2 font-extrabold">graz</span>
      <span>React Hooks for Cosmos</span>
    </>
  ),
};
