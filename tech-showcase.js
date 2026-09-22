/* ==========================================================================
   ES.DEV — Tech Stack showcase (section #tech)
   Desktop / tablet: the section pins and the wheel scrubs a rail of technologies,
   one active at a time (scroll progress = animation progress, reversible).
   Phone: a horizontal swipe strip with scroll-snap, no pin.
   Every technology is a button: click opens a detail panel inside the section.
   Depends on GSAP + ScrollTrigger already loaded by index.html.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     Data — edit here only. Brand marks are the official logos from simple-icons (CC0);
     each remains a trademark of its project. UI/UX uses a custom line icon.
     ------------------------------------------------------------------------ */
  var TECHNOLOGIES = [
    { id: 'uiux', name: 'UI/UX', color: '#1F5BE3',
      desc: 'Interfaces designed around clarity, interaction and user experience.',
      tags: ['Wireframes', 'Responsive Design', 'Interaction Design', 'Prototyping'],
      logo: '<svg viewBox="0 0 64 64"><rect x="8" y="10" width="48" height="36" rx="4"/><path d="M8 20h48M20 46v8m24-8v8M14 54h36"/><path d="M26 32l6 6 8-10" /></svg>' },
    { id: 'react', name: 'React', color: '#61DAFB',
      desc: 'Component-driven interfaces for modern interactive web experiences.',
      tags: ['Components', 'Responsive UI', 'API Integration', 'Interactive Experiences'],
      logo: '<svg viewBox="0 0 24 24" class="tech__brandmark"><path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"/></svg>' },
    { id: 'php', name: 'PHP', color: '#777BB4',
      desc: 'Server-side development for dynamic websites and custom functionality.',
      tags: ['Backend Logic', 'Forms', 'API Integration', 'Database Integration'],
      logo: '<svg viewBox="0 0 24 24" class="tech__brandmark"><path d="M7.01 10.207h-.944l-.515 2.648h.838c.556 0 .97-.105 1.242-.314.272-.21.455-.559.55-1.049.092-.47.05-.802-.124-.995-.175-.193-.523-.29-1.047-.29zM12 5.688C5.373 5.688 0 8.514 0 12s5.373 6.313 12 6.313S24 15.486 24 12c0-3.486-5.373-6.312-12-6.312zm-3.26 7.451c-.261.25-.575.438-.917.551-.336.108-.765.164-1.285.164H5.357l-.327 1.681H3.652l1.23-6.326h2.65c.797 0 1.378.209 1.744.628.366.418.476 1.002.33 1.752a2.836 2.836 0 0 1-.305.847c-.143.255-.33.49-.561.703zm4.024.715l.543-2.799c.063-.318.039-.536-.068-.651-.107-.116-.336-.174-.687-.174H11.46l-.704 3.625H9.388l1.23-6.327h1.367l-.327 1.682h1.218c.767 0 1.295.134 1.586.401s.378.7.263 1.299l-.572 2.944h-1.389zm7.597-2.265a2.782 2.782 0 0 1-.305.847c-.143.255-.33.49-.561.703a2.44 2.44 0 0 1-.917.551c-.336.108-.765.164-1.286.164h-1.18l-.327 1.682h-1.378l1.23-6.326h2.649c.797 0 1.378.209 1.744.628.366.417.477 1.001.331 1.751zM17.766 10.207h-.943l-.516 2.648h.838c.557 0 .971-.105 1.242-.314.272-.21.455-.559.551-1.049.092-.47.049-.802-.125-.995s-.524-.29-1.047-.29z"/></svg>' },
    { id: 'html', name: 'HTML', color: '#E34F26',
      desc: 'Clean semantic foundations for accessible and responsive websites.',
      tags: ['Semantic Structure', 'Accessibility', 'SEO Structure', 'Responsive Markup'],
      logo: '<svg viewBox="0 0 24 24" class="tech__brandmark"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"/></svg>' },
    { id: 'css', name: 'CSS', color: '#1572B6',
      desc: 'Modern styling, responsive layouts and polished visual experiences.',
      tags: ['Responsive Design', 'Flexbox & Grid', 'Animations', 'Custom Styling'],
      logo: '<svg viewBox="0 0 24 24" class="tech__brandmark"><path d="M0 0v20.16A3.84 3.84 0 0 0 3.84 24h16.32A3.84 3.84 0 0 0 24 20.16V3.84A3.84 3.84 0 0 0 20.16 0Zm14.256 13.08c1.56 0 2.28 1.08 2.304 2.64h-1.608c.024-.288-.048-.6-.144-.84-.096-.192-.288-.264-.552-.264-.456 0-.696.264-.696.84-.024.576.288.888.768 1.08.72.288 1.608.744 1.92 1.296q.432.648.432 1.656c0 1.608-.912 2.592-2.496 2.592-1.656 0-2.4-1.032-2.424-2.688h1.68c0 .792.264 1.176.792 1.176.264 0 .456-.072.552-.24.192-.312.24-1.176-.048-1.512-.312-.408-.912-.6-1.32-.816q-.828-.396-1.224-.936c-.24-.36-.36-.888-.36-1.536 0-1.44.936-2.472 2.424-2.448m5.4 0c1.584 0 2.304 1.08 2.328 2.64h-1.608c0-.288-.048-.6-.168-.84-.096-.192-.264-.264-.528-.264-.48 0-.72.264-.72.84s.288.888.792 1.08c.696.288 1.608.744 1.92 1.296.264.432.408.984.408 1.656.024 1.608-.888 2.592-2.472 2.592-1.68 0-2.424-1.056-2.448-2.688h1.68c0 .744.264 1.176.792 1.176.264 0 .456-.072.552-.24.216-.312.264-1.176-.048-1.512-.288-.408-.888-.6-1.32-.816-.552-.264-.96-.576-1.2-.936s-.36-.888-.36-1.536c-.024-1.44.912-2.472 2.4-2.448m-11.031.018c.711-.006 1.419.198 1.839.63.432.432.672 1.128.648 1.992H9.336c.024-.456-.096-.792-.432-.96-.312-.144-.768-.048-.888.24-.12.264-.192.576-.168.864v3.504c0 .744.264 1.128.768 1.128a.65.65 0 0 0 .552-.264c.168-.24.192-.552.168-.84h1.776c.096 1.632-.984 2.712-2.568 2.688-1.536 0-2.496-.864-2.472-2.472v-4.032c0-.816.24-1.44.696-1.848.432-.408 1.146-.624 1.857-.63"/></svg>' },
    { id: 'js', name: 'JavaScript', color: '#F7DF1E',
      desc: 'Interactive behavior and advanced front-end experiences.',
      tags: ['DOM Interaction', 'Animations', 'APIs', 'Custom Functionality'],
      logo: '<svg viewBox="0 0 24 24" class="tech__brandmark"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/></svg>' },
    { id: 'jquery', name: 'jQuery', color: '#0769AD',
      desc: 'Efficient interaction and maintenance for existing web experiences.',
      tags: ['DOM Manipulation', 'Events', 'AJAX', 'Legacy Projects'],
      logo: '<svg viewBox="0 0 24 24" class="tech__brandmark"><path d="M1.525 5.87c-2.126 3.054-1.862 7.026-.237 10.269.037.079.078.154.118.229.023.052.049.1.077.15.013.027.031.056.047.082.026.052.054.102.081.152l.157.266c.03.049.057.097.09.146.056.094.12.187.178.281.026.04.05.078.079.117a6.368 6.368 0 00.31.445c.078.107.156.211.24.315.027.038.058.076.086.115l.22.269c.028.03.055.067.084.099.098.118.202.233.306.35l.005.006a3.134 3.134 0 00.425.44c.08.083.16.165.245.245l.101.097c.111.105.223.209.34.309.002 0 .003.002.005.003l.057.05c.102.089.205.178.31.26l.125.105c.085.068.174.133.26.2l.137.105c.093.07.192.139.287.207.035.025.07.05.106.073l.03.023.28.185.12.08c.148.094.294.184.44.272.041.02.084.044.123.068.108.062.22.125.329.183.06.034.122.063.184.094.075.042.153.083.234.125a.324.324 0 01.056.023c.033.015.064.031.096.047.12.06.245.118.375.175.024.01.05.02.076.034.144.063.289.123.438.182.034.01.07.027.105.04.135.051.274.103.411.152l.05.018c.154.052.305.102.46.15.036.01.073.023.111.033.16.048.314.105.474.137 10.273 1.872 13.258-6.177 13.258-6.177-2.508 3.266-6.958 4.127-11.174 3.169-.156-.036-.312-.086-.47-.132a13.539 13.539 0 01-.567-.182l-.062-.024c-.136-.046-.267-.097-.4-.148a1.615 1.615 0 00-.11-.04c-.148-.06-.29-.121-.433-.184-.031-.01-.057-.024-.088-.036a23.44 23.44 0 01-.362-.17 1.485 1.485 0 01-.106-.052c-.094-.044-.188-.095-.28-.143a3.947 3.947 0 01-.187-.096c-.114-.06-.227-.125-.34-.187-.034-.024-.073-.044-.112-.066a15.922 15.922 0 01-.439-.27 2.107 2.107 0 01-.118-.078 6.01 6.01 0 01-.312-.207c-.035-.023-.067-.048-.103-.073a9.553 9.553 0 01-.295-.212c-.042-.034-.087-.066-.132-.1-.088-.07-.177-.135-.265-.208l-.118-.095a10.593 10.593 0 01-.335-.28.258.258 0 00-.037-.031l-.347-.316-.1-.094c-.082-.084-.166-.164-.25-.246l-.098-.1a9.081 9.081 0 01-.309-.323l-.015-.016c-.106-.116-.21-.235-.313-.355-.027-.03-.053-.064-.08-.097l-.227-.277a21.275 21.275 0 01-.34-.449C2.152 11.79 1.306 7.384 3.177 3.771m4.943-.473c-1.54 2.211-1.454 5.169-.254 7.508a9.111 9.111 0 00.678 1.133c.23.33.484.721.793.988.107.122.223.24.344.36l.09.09c.114.11.232.217.35.325l.016.013a9.867 9.867 0 00.414.342c.034.023.063.05.096.073.14.108.282.212.428.316l.015.009c.062.045.128.086.198.13.028.018.06.042.09.06.106.068.21.132.318.197.017.007.032.016.048.023.09.055.188.108.282.157.033.02.065.035.1.054.066.033.132.068.197.102l.032.014c.135.067.273.129.408.19.034.014.063.025.092.039.111.048.224.094.336.137.05.017.097.037.144.052.102.038.21.073.31.108l.14.045c.147.045.295.104.449.13C22.164 17.206 24 11.098 24 11.098c-1.653 2.38-4.852 3.513-8.261 2.628a8.04 8.04 0 01-.449-.13c-.048-.014-.09-.029-.136-.043-.104-.036-.211-.07-.312-.109l-.144-.054c-.113-.045-.227-.087-.336-.135-.034-.015-.065-.025-.091-.04-.14-.063-.281-.125-.418-.192l-.206-.107-.119-.06a5.673 5.673 0 01-.265-.15.62.62 0 01-.062-.035c-.106-.066-.217-.13-.318-.198-.034-.019-.065-.042-.097-.062l-.208-.136c-.144-.1-.285-.208-.428-.313-.032-.029-.063-.053-.094-.079-1.499-1.178-2.681-2.79-3.242-4.613-.59-1.897-.46-4.023.56-5.75m4.292-.147c-.909 1.334-.996 2.99-.37 4.46.665 1.563 2.024 2.79 3.608 3.37.065.025.128.046.196.07l.088.027c.092.03.185.063.28.084 4.381.845 5.567-2.25 5.886-2.704-1.043 1.498-2.792 1.857-4.938 1.335a4.85 4.85 0 01-.516-.16 6.352 6.352 0 01-.618-.254 6.53 6.53 0 01-1.082-.66c-1.922-1.457-3.113-4.236-1.859-6.5"/></svg>' },
    { id: 'bootstrap', name: 'Bootstrap', color: '#7952B3',
      desc: 'Responsive interface development using a reliable component system.',
      tags: ['Responsive Grid', 'Components', 'Layouts', 'Rapid Development'],
      logo: '<svg viewBox="0 0 24 24" class="tech__brandmark"><path d="M11.77 11.24H9.956V8.202h2.152c1.17 0 1.834.522 1.834 1.466 0 1.008-.773 1.572-2.174 1.572zm.324 1.206H9.957v3.348h2.231c1.459 0 2.232-.585 2.232-1.685s-.795-1.663-2.326-1.663zM24 11.39v1.218c-1.128.108-1.817.944-2.226 2.268-.407 1.319-.463 2.937-.42 4.186.045 1.3-.968 2.5-2.337 2.5H4.985c-1.37 0-2.383-1.2-2.337-2.5.043-1.249-.013-2.867-.42-4.186-.41-1.324-1.1-2.16-2.228-2.268V11.39c1.128-.108 1.819-.944 2.227-2.268.408-1.319.464-2.937.42-4.186-.045-1.3.968-2.5 2.338-2.5h14.032c1.37 0 2.382 1.2 2.337 2.5-.043 1.249.013 2.867.42 4.186.409 1.324 1.098 2.16 2.226 2.268zm-7.927 2.817c0-1.354-.953-2.333-2.368-2.488v-.057c1.04-.169 1.856-1.135 1.856-2.213 0-1.537-1.213-2.538-3.062-2.538h-4.16v10.172h4.181c2.218 0 3.553-1.086 3.553-2.876z"/></svg>' },
    { id: 'wordpress', name: 'WordPress', color: '#21759B',
      desc: 'Flexible websites built around manageable content and custom functionality.',
      tags: ['Custom Websites', 'Theme Customization', 'WooCommerce', 'Performance'],
      logo: '<svg viewBox="0 0 24 24" class="tech__brandmark"><path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.09l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.075.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C4.911 3.15 8.235 1.215 12 1.215c2.809 0 5.365 1.072 7.286 2.833-.046-.003-.091-.009-.141-.009-1.06 0-1.812.923-1.812 1.914 0 .89.513 1.643 1.06 2.531.411.72.89 1.643.89 2.977 0 .915-.354 1.994-.821 3.479l-1.075 3.585-3.9-11.61.001.014zM12 22.784c-1.059 0-2.081-.153-3.048-.437l3.237-9.406 3.315 9.087c.024.053.05.101.078.149-1.12.393-2.325.609-3.582.609M1.211 12c0-1.564.336-3.05.935-4.39L7.29 21.709C3.694 19.96 1.212 16.271 1.211 12M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0"/></svg>' }
  ];

  var doc = document;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var section = doc.getElementById('tech');
  if (!section) return;

  var rail = doc.getElementById('techRail');
  var infoEl = doc.getElementById('techInfo');
  var nameEl = doc.getElementById('techName');
  var descEl = doc.getElementById('techDesc');
  var tagsEl = doc.getElementById('techTags');
  var indexEl = doc.getElementById('techIndex');
  var totalEl = doc.getElementById('techTotal');
  var barEl = doc.getElementById('techBar');
  var hintEl = doc.getElementById('techHint');
  var moreBtn = doc.getElementById('techMore');
  var detail = doc.getElementById('techDetail');

  var items = [];
  var total = TECHNOLOGIES.length;
  var active = 0;          // index shown in the info block
  var pinTrigger = null;   // desktop / tablet ScrollTrigger
  var mode = 'static';     // 'pinned' | 'strip' | 'static'
  var detailOpen = false;
  var lastFocus = null;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ------------------------------------------------------------------------
     Build the rail
     ------------------------------------------------------------------------ */
  function build() {
    rail.innerHTML = '';
    items = TECHNOLOGIES.map(function (tech, i) {
      var button = doc.createElement('button');
      button.type = 'button';
      button.className = 'tech__item';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', 'false');
      button.setAttribute('aria-label', tech.name + ' — open details');
      button.style.setProperty('--brand', tech.color);
      button.innerHTML = '<span class="tech__logo" aria-hidden="true">' + tech.logo + '</span><span class="tech__label">' + tech.name + '</span>';
      button.addEventListener('click', function () { onItemClick(i); });
      rail.appendChild(button);
      return button;
    });
    totalEl.textContent = pad(total);
    renderInfo(0);
  }

  /* ------------------------------------------------------------------------
     Rail layout — pure function of a continuous position (0 … total-1)
     ------------------------------------------------------------------------ */
  function spacing() {
    var w = window.innerWidth;
    return w >= 1400 ? 320 : w >= 1024 ? 270 : 215;
  }

  function layout(pos) {
    var gap = spacing();
    items.forEach(function (item, i) {
      var d = i - pos;                       // signed distance from the centre
      var a = Math.abs(d);
      var scale = a < 1 ? 1 - a * 0.34 : 0.66 - Math.min(a - 1, 2) * 0.05;
      var opacity = a < 1 ? 1 - a * 0.45 : Math.max(0.12, 0.55 - (a - 1) * 0.18);
      var x = d * gap * (a < 1 ? 1 : 1 - Math.min(a - 1, 3) * 0.08);
      var y = Math.min(a, 1) * 18;
      var isActive = a < 0.5;
      gsap.set(item, { x: x, y: y, scale: scale, opacity: opacity, zIndex: 100 - Math.round(a * 10) });
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', String(isActive));
      item.tabIndex = isActive ? 0 : -1;
    });

    // info block: fully visible at whole numbers, hands over at the midpoint
    var frac = pos - Math.floor(pos);
    var near = Math.round(pos);
    if (near !== active) { active = near; renderInfo(active); }
    var v = 1 - Math.min(frac, 1 - frac) * 2;           // 1 at integer, 0 at .5
    var dir = frac < 0.5 ? 1 : -1;
    gsap.set(infoEl, { opacity: v * v, y: (1 - v) * 18 * dir });
    gsap.set(barEl, { scaleX: pos / (total - 1) });
    if (hintEl) gsap.set(hintEl, { opacity: pos < 0.15 ? 1 : 0 });
  }

  function renderInfo(i) {
    var tech = TECHNOLOGIES[i];
    nameEl.textContent = tech.name;
    descEl.textContent = tech.desc;
    tagsEl.innerHTML = tech.tags.map(function (t) { return '<li>' + t + '</li>'; }).join('');
    indexEl.textContent = pad(i + 1);
    infoEl.style.setProperty('--brand', tech.color);
    if (gsap && !reducedMotion.matches) {
      gsap.fromTo(tagsEl.children, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out', overwrite: true });
    }
  }

  /* ------------------------------------------------------------------------
     Desktop / tablet: pinned, scrubbed journey
     ------------------------------------------------------------------------ */
  var mm = null;
  function initModes() {
    mm = gsap.matchMedia();

  mm.add('(min-width: 768px)', function () {
    if (reducedMotion.matches) { mode = 'static'; initStatic(); return; }
    mode = 'pinned';
    section.classList.add('tech--pinned');
    var stepVh = window.innerWidth >= 1024 ? 0.5 : 0.4;       // scroll distance per technology
    var drive = { pos: 0 };

    function setTravel() {
      section.style.setProperty('--travel', Math.round((total - 1) * stepVh * window.innerHeight) + 'px');
    }
    setTravel();

    // The stage is CSS position: sticky, so nothing is moved by JS. This trigger only reads
    // how far the section has scrolled and turns it into the rail position.
    var tween = gsap.fromTo(drive, { pos: 0 }, {
      pos: total - 1, ease: 'none',
      onUpdate: function () { layout(drive.pos); },
      scrollTrigger: {
        trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.8, invalidateOnRefresh: true,
        onRefreshInit: setTravel,
        // after any re-measure, put the rail exactly where the scroll says it should be
        onRefresh: function (self) { drive.pos = (total - 1) * self.progress; layout(drive.pos); }
      }
    });
    pinTrigger = tween.scrollTrigger;
    drive.pos = (total - 1) * pinTrigger.progress;
    layout(drive.pos);

    return function () {                                         // breakpoint change: clean up
      tween.kill(); pinTrigger = null; mode = 'static';
      section.classList.remove('tech--pinned');
      section.style.removeProperty('--travel');
      items.forEach(function (item) { gsap.set(item, { clearProps: 'all' }); });
    };
  });

  /* ------------------------------------------------------------------------
     Phone: horizontal snap strip, the nearest-centre item is active
     ------------------------------------------------------------------------ */
  mm.add('(max-width: 767px)', function () {
    mode = 'strip';
    section.classList.add('tech--strip');
    items.forEach(function (item) { gsap.set(item, { clearProps: 'all' }); });
    gsap.set(infoEl, { clearProps: 'all' });
    if (hintEl) hintEl.textContent = 'Swipe to explore';

    var ticking = false;
    function update() {
      ticking = false;
      var centre = rail.scrollLeft + rail.clientWidth / 2;
      var best = 0, bestD = Infinity;
      items.forEach(function (item, i) {
        var d = Math.abs(item.offsetLeft + item.offsetWidth / 2 - centre);
        if (d < bestD) { bestD = d; best = i; }
      });
      items.forEach(function (item, i) {
        item.classList.toggle('is-active', i === best);
        item.setAttribute('aria-selected', String(i === best));
      });
      if (best !== active) { active = best; renderInfo(active); }
      gsap.set(barEl, { scaleX: best / (total - 1) });
    }
    function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }
    rail.addEventListener('scroll', onScroll, { passive: true });
    update();

    return function () {
      rail.removeEventListener('scroll', onScroll);
      section.classList.remove('tech--strip');
      if (hintEl) hintEl.textContent = 'Scroll to explore';
    };
  });

  }

  /* Reduced motion (any size): a plain selector row, click to choose */
  function initStatic() {
    section.classList.add('tech--static');
    items.forEach(function (item, i) {
      gsap.set(item, { clearProps: 'all' });
      item.classList.toggle('is-active', i === active);
      item.tabIndex = 0;
    });
    if (hintEl) hintEl.textContent = 'Select a technology';
  }

  /* ------------------------------------------------------------------------
     Click: select, then show details in place
     ------------------------------------------------------------------------ */
  function onItemClick(i) {
    if (mode === 'pinned' && pinTrigger && i !== active) {
      // jump the page to this technology's spot in the pinned journey, then open
      // jump instantly; the scrubbed rail glides to the new spot on its own, then the panel opens
      var y = pinTrigger.start + (pinTrigger.end - pinTrigger.start) * (i / (total - 1));
      window.scrollTo({ top: y, behavior: 'instant' });
      window.setTimeout(function () { openDetail(i); }, reducedMotion.matches ? 0 : 650);
      return;
    }
    if (mode === 'strip' && i !== active) {
      items[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    if (mode === 'static') { active = i; renderInfo(i); items.forEach(function (item, k) { item.classList.toggle('is-active', k === i); }); }
    openDetail(i);
  }

  function openDetail(i) {
    var tech = TECHNOLOGIES[i];
    active = i;
    doc.getElementById('techDetailIndex').textContent = pad(i + 1) + ' / ' + pad(total);
    doc.getElementById('techDetailWatermark').textContent = pad(i + 1);
    doc.getElementById('techDetailLogo').innerHTML = tech.logo;
    doc.getElementById('techDetailName').textContent = tech.name;
    doc.getElementById('techDetailDesc').textContent = tech.desc;
    doc.getElementById('techDetailList').innerHTML = tech.tags.map(function (t, k) { return '<li><i>' + pad(k + 1) + '</i>' + t + '</li>'; }).join('');
    doc.getElementById('techPrevName').textContent = TECHNOLOGIES[(i - 1 + total) % total].name;
    doc.getElementById('techNextName').textContent = TECHNOLOGIES[(i + 1) % total].name;
    detail.style.setProperty('--brand', tech.color);

    if (!detailOpen) {
      detailOpen = true;
      lastFocus = doc.activeElement;
      detail.hidden = false;
      section.classList.add('is-detail');
      // page scroll is paused so the wheel cannot change the selection behind the panel
      doc.documentElement.style.overflow = 'hidden';
      if (!reducedMotion.matches) {
        gsap.fromTo(detail, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
        gsap.fromTo(detail.querySelector('.tech__detail-inner'), { y: 30, scale: 0.98 }, { y: 0, scale: 1, duration: 0.6, ease: 'expo.out' });
        gsap.fromTo('.tech__detail-side > *, .tech__detail-body > *', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.05, ease: 'power3.out', delay: 0.1 });
      }
    } else if (!reducedMotion.matches) {
      gsap.fromTo('.tech__detail-side > *, .tech__detail-body > *', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.04, ease: 'power3.out' });
    }
    doc.getElementById('techClose').focus({ preventScroll: true });
  }

  function closeDetail() {
    if (!detailOpen) return;
    detailOpen = false;
    function done() {
      detail.hidden = true;
      section.classList.remove('is-detail');
      doc.documentElement.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      // nothing moved while the panel was open, so the existing trigger positions are still exact
    }
    if (reducedMotion.matches) { done(); return; }
    gsap.to(detail, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: done });
  }

  doc.getElementById('techClose').addEventListener('click', closeDetail);
  doc.getElementById('techPrev').addEventListener('click', function () { openDetail((active - 1 + total) % total); });
  doc.getElementById('techNext').addEventListener('click', function () { openDetail((active + 1) % total); });
  if (moreBtn) moreBtn.addEventListener('click', function () { openDetail(active); });
  detail.addEventListener('click', function (event) { if (event.target === detail) closeDetail(); });
  doc.addEventListener('keydown', function (event) {
    if (!detailOpen) return;
    if (event.key === 'Escape') closeDetail();
    if (event.key === 'ArrowRight') openDetail((active + 1) % total);
    if (event.key === 'ArrowLeft') openDetail((active - 1 + total) % total);
  });

  // keyboard on the rail: arrows move the selection
  rail.addEventListener('keydown', function (event) {
    var delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    var next = Math.min(total - 1, Math.max(0, active + delta));
    if (mode === 'pinned' && pinTrigger) {
      window.scrollTo({ top: pinTrigger.start + (pinTrigger.end - pinTrigger.start) * (next / (total - 1)), behavior: 'instant' });
    } else if (mode === 'strip') {
      items[next].scrollIntoView({ block: 'nearest', inline: 'center' });
    } else { active = next; renderInfo(next); items.forEach(function (item, k) { item.classList.toggle('is-active', k === next); }); }
    items[next].focus({ preventScroll: true });
  });

  /* ------------------------------------------------------------------------
     Start once the loader has revealed the page (script.js fires esdev:ready)
     ------------------------------------------------------------------------ */
  // Stack chips elsewhere on the page (Services, Projects): show the brand mark and open that technology
  function initStackChips() {
    Array.prototype.forEach.call(doc.querySelectorAll('.stack__chip[data-tech]'), function (chip) {
      var index = -1;
      TECHNOLOGIES.forEach(function (tech, i) { if (tech.id === chip.getAttribute('data-tech')) index = i; });
      if (index < 0) return;
      chip.style.setProperty('--brand', TECHNOLOGIES[index].color);
      chip.insertAdjacentHTML('afterbegin', TECHNOLOGIES[index].logo.replace('class="tech__brandmark"', 'class="tech__brandmark" aria-hidden="true"'));
      chip.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();   // keep the site's generic #anchor handler out of it
        var y = pinTrigger ? pinTrigger.start + (pinTrigger.end - pinTrigger.start) * (index / (total - 1)) : section.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: y, behavior: 'instant' });                      // the scrubbed rail glides on its own
        if (mode === 'strip') items[index].scrollIntoView({ block: 'nearest', inline: 'center' });
        window.setTimeout(function () { openDetail(index); }, reducedMotion.matches ? 0 : 700);
      });
    });
  }

  function start() {
    if (!gsap || !ScrollTrigger) { section.classList.add('tech--static'); build(); initStackChips(); return; }
    gsap.registerPlugin(ScrollTrigger);
    build();
    initModes();
    initStackChips();
    ScrollTrigger.refresh();
  }
  if (window.ESDEV_READY) start(); else doc.addEventListener('esdev:ready', start, { once: true });
})();
