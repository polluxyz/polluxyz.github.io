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

  const opener1 = document.getElementsByClassName("opener")[0];
  const opener2 = document.getElementsByClassName("opener")[1];

  opener1.addEventListener("click", function () {
    if (opener1.classList.contains("active")) {
      opener1.classList.remove("active");
    } else {
      opener1.classList.add("active");
    }
  });
  opener2.addEventListener("click", function () {
    if (opener2.classList.contains("active")) {
      opener2.classList.remove("active");
    } else {
      opener2.classList.add("active");
    }
  });
});
