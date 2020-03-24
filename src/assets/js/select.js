$('#select-multiple').selectDropdown({

  // max number of options to display within the dropdown button
  maxListLength: 4,

  // hide the select
  hideSelect: true,

  // keeps dropdown open for multiselects.
  multiselectStayOpen: true,

  // enables fuzzy search
  search: true,

  // respects dynamic changes to the select options.
  observeDomMutations: false,

  // max height of the dropdown
  maxHeight: '300px',

  // custom text
  textNoneSelected: "None selected",
  textMultipleSelected: "Multiple selected",
  textNoResults: "No results",
  htmlClear: "Clear search",

  // default CSS classes
  classDropdown: "dropdown",
  classBtnClear: "btn btn-outline-secondary",
  classBtnSearch: "btn btn-primary",
  class<a href="https://www.jqueryscript.net/menu/">Menu</a>: "dropdown-menu",
  classItem: "dropdown-item"

});
