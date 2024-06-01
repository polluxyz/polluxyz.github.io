document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const content = document.getElementById("content");
  const input = document.getElementById("input");
  const menu = document.getElementById("menu");

  sidebarToggle.addEventListener("click", function () {
    if (sidebar.classList.contains("collapsed")) {
      sidebar.classList.remove("collapsed");
      sidebar.classList.add("expanded");
      sidebarToggle.classList.remove("collapsed");
      sidebarToggle.classList.add("expanded");
      input.classList.remove("collapsed");
      input.setAttribute("type", "search"); //修改input type屬性
      menu.classList.remove("collapsed");
      console.log("start");
    } else {
      sidebar.classList.remove("expanded");
      sidebar.classList.add("collapsed");
      sidebarToggle.classList.remove("expanded");
      sidebarToggle.classList.add("collapsed");
      input.classList.add("collapsed");
      input.setAttribute("type", "hidden"); //修改input type屬性
      menu.classList.add("collapsed");
    }
  });
});
