document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded - scout-games-interface.js loaded');
  
  // Check if Vue is available
  if (typeof Vue === 'undefined') {
    console.error('Vue is not loaded! Please check script dependencies.');
    document.getElementById('scout-games-app').innerHTML = '<div style="color:red;padding:20px;">Error: Vue.js could not be loaded. Please contact the administrator.</div>';
    return;
  }
  
  // Check if Vuetify is available
  if (typeof Vuetify === 'undefined') {
    console.error('Vuetify is not loaded! Please check script dependencies.');
    document.getElementById('scout-games-app').innerHTML = '<div style="color:red;padding:20px;">Error: Vuetify could not be loaded. Please contact the administrator.</div>';
    return;
  }
  
  // Check if PapaParse is available
  if (typeof Papa === 'undefined') {
    console.error('PapaParse is not loaded! Please check script dependencies.');
    document.getElementById('scout-games-app').innerHTML = '<div style="color:red;padding:20px;">Error: PapaParse could not be loaded. Please contact the administrator.</div>';
    return;
  }
  
  console.log('All dependencies loaded, initializing app');
  const { createApp, ref, reactive, computed, onMounted } = Vue;

  // 1) Prepare filter states
  function buildFilters() {
    return {
      textSearch: ref(''),
      // New multi-select filters replacing checkboxes:
      terSelect: ref([]),
      csoportSelect: ref([]),
      ageSelect: ref([]),
      // Existing multi-select filters remain
      letszamSelect: ref([]),
      idoSelect: ref([]),
      funkcioSelect: ref([])
    };
  }

  // 2) Prepare data arrays
  function buildTable() {
    return {
      allRows: ref([]),       // entire data from the sheet
      filteredRows: ref([]),  // subset for display
      showDialog: ref(false),
      dialogItem: ref(null)
    };
  }

  // 3) Download CSV data
  // Updated to accept a loading reference and set it to false after data is fetched
  function fetchData(allRowsRef, applyFilters, loading) {
    console.log('Fetching data from Google Sheets...');
    Papa.parse('https://docs.google.com/spreadsheets/d/e/2PACX-1vRcx1YPhoi6kUVe36T4T2162AhCdBwuVSX0ou2u-Vlicjf2So3VL3E2MDzrNYIbkgckP4n8p18_UOGP/pub?gid=0&single=true&output=csv',
      {
        download: true,
        skipEmptyLines: true,
        complete: (results) => {
          //console.log('CSV data received!', results);
          //console.log('CSV data received!');
          // Slice first 3 rows (header info):
          const data = results.data.slice(3);
          allRowsRef.value = data.map(row => mapRow(row));
          // applyFilters once fetched
          applyFilters();
          // Hide loader immediately after data is fetched
          loading.value = false;
        },
        error: (error) => {
          console.error('Error fetching CSV:', error);
          loading.value = false;
          document.getElementById('scout-games-app').innerHTML = 
            '<div style="color:red;padding:20px;">Error loading game data. Please try again later or contact the administrator.</div>';
        }
      }
    );
  }

  // 4) Convert each CSV row into an object
  function mapRow(row) {
    return {
      name: row[0] || '',
      alternative: row[1] || '',
      objective: row[2] || '',
      rules: row[3] || '',
      tools: row[4] || '',
      source: row[5] || '',

      // Convert CSV boolean values to lowercase before comparing
      ter_kulteri: (row[6] || '').trim().toLowerCase() === 'true',
      ter_belteri:  (row[7] || '').trim().toLowerCase() === 'true',
      csp_alakulas:  (row[8] || '').trim().toLowerCase() === 'true',
      csp_viharzas:  (row[9] || '').trim().toLowerCase() === 'true',
      csp_normazas:  (row[10] || '').trim().toLowerCase() === 'true',
      csp_mukodes:   (row[11] || '').trim().toLowerCase() === 'true',
      age_0_5:       (row[12] || '').trim().toLowerCase() === 'true',
      age_6_10:      (row[13] || '').trim().toLowerCase() === 'true',
      age_11_13:     (row[14] || '').trim().toLowerCase() === 'true',
      age_14_16:     (row[15] || '').trim().toLowerCase() === 'true',
      age_17plus:    (row[16] || '').trim().toLowerCase() === 'true',

      // Funkció
      func1: row[17] || '',
      func2: row[18] || '',
      func3: row[19] || '',

      // Létszám
      lt_3_5:  (row[20] || '').trim().toLowerCase() === 'true',
      lt_6_15: (row[21] || '').trim().toLowerCase() === 'true',
      lt_16_30:(row[22] || '').trim().toLowerCase() === 'true',
      lt_30plus:(row[23] || '').trim().toLowerCase() === 'true',

      // Időtartam
      time_3_10: (row[24] || '').trim().toLowerCase() === 'true',
      time_11_20:(row[25] || '').trim().toLowerCase() === 'true',
      time_21_30:(row[26] || '').trim().toLowerCase() === 'true',
      time_30plus:(row[27] || '').trim().toLowerCase() === 'true',

      raw: row
    };
  }

  // 5) Filter logic
  function filterData(filters, tableState) {
    const text = filters.textSearch.value.toLowerCase();

    tableState.filteredRows.value = tableState.allRows.value.filter(row => {
      // Basic free-text search on name + alternative
      const merged = (row.name + ' ' + row.alternative + ' ' + row.objective + ' ' + row.rules).toLowerCase();
      if (text && !merged.includes(text)) return false;

      // Multi-select filter: Tér (at least one matching)
      if (filters.terSelect.value.length > 0) {
        if (!( (filters.terSelect.value.includes('Kültéri') && row.ter_kulteri) ||
               (filters.terSelect.value.includes('Beltéri') && row.ter_belteri) ))
          return false;
      }

      // Multi-select filter: Csoport
      if (filters.csoportSelect.value.length > 0) {
        if (!( (filters.csoportSelect.value.includes('Alakulás') && row.csp_alakulas) ||
               (filters.csoportSelect.value.includes('Viharzás') && row.csp_viharzas) ||
               (filters.csoportSelect.value.includes('Normázás') && row.csp_normazas) ||
               (filters.csoportSelect.value.includes('Működés') && row.csp_mukodes) ))
          return false;
      }

      // Multi-select filter: Korosztály
      if (filters.ageSelect.value.length > 0) {
        if (!( (filters.ageSelect.value.includes('0-5') && row.age_0_5) ||
               (filters.ageSelect.value.includes('6-10') && row.age_6_10) ||
               (filters.ageSelect.value.includes('11-13') && row.age_11_13) ||
               (filters.ageSelect.value.includes('14-16') && row.age_14_16) ||
               (filters.ageSelect.value.includes('17+') && row.age_17plus) ))
          return false;
      }

      // Multi-select filter: Létszám
      if (filters.letszamSelect.value.length > 0) {
        if (!( (filters.letszamSelect.value.includes('3-5 fő') && row.lt_3_5) ||
               (filters.letszamSelect.value.includes('6-15 fő') && row.lt_6_15) ||
               (filters.letszamSelect.value.includes('16-30 fő') && row.lt_16_30) ||
               (filters.letszamSelect.value.includes('30+ fő') && row.lt_30plus) ))
          return false;
      }

      // Multi-select filter: Időtartam
      if (filters.idoSelect.value.length > 0) {
        if (!( (filters.idoSelect.value.includes('3-10p') && row.time_3_10) ||
               (filters.idoSelect.value.includes('11-20p') && row.time_11_20) ||
               (filters.idoSelect.value.includes('21-30p') && row.time_21_30) ||
               (filters.idoSelect.value.includes('30+p') && row.time_30plus) ))
          return false;
      }

      // Multi-select filter: Funkciók remains as checking each selected option in rowFunctions:
      if (filters.funkcioSelect.value.length > 0) {
        const rowFunctions = [row.func1, row.func2, row.func3].map(f => f.trim());
        for (const option of filters.funkcioSelect.value) {
          if (!rowFunctions.includes(option)) return false;
        }
      }

      return true;
    });
  }

  // Helper to skip a filter if that filter not active (false), or require row if true
  function checkBoolRow(rowValue, filterValue) {
    // If filterValue is false, no requirement
    if (!filterValue) return true;
    // else must match rowValue
    return rowValue;
  }

  // 6) Clear all filters
  function clearAllFilters(filters, applyFilters) {
    filters.textSearch.value = '';
    filters.terSelect.value = [];
    filters.csoportSelect.value = [];
    filters.ageSelect.value = [];
    filters.letszamSelect.value = [];
    filters.idoSelect.value = [];
    filters.funkcioSelect.value = [];
    applyFilters();
  }

  // 7) Render row fields as small tags
  function buildTagList(row, type) {
    const results = [];
    if (type === 'age') {
      if (row.age_0_5) results.push('0-5');
      if (row.age_6_10) results.push('6-10');
      if (row.age_11_13) results.push('11-13');
      if (row.age_14_16) results.push('14-16');
      if (row.age_17plus) results.push('17+');
    } else if (type === 'ter') {
      if (row.ter_kulteri) results.push('Kültéri');
      if (row.ter_belteri) results.push('Beltéri');
    } else if (type === 'csoport') {
      if (row.csp_alakulas) results.push('Alakulás');
      if (row.csp_viharzas) results.push('Viharzás');
      if (row.csp_normazas) results.push('Normázás');
      if (row.csp_mukodes) results.push('Működés');
    } else if (type === 'letszam') {
      if (row.lt_3_5) results.push('3-5 fő');
      if (row.lt_6_15) results.push('6-15 fő');
      if (row.lt_16_30) results.push('16-30 fő');
      if (row.lt_30plus) results.push('30+ fő');
    } else if (type === 'time') {
      if (row.time_3_10) results.push('3-10p');
      if (row.time_11_20) results.push('11-20p');
      if (row.time_21_30) results.push('21-30p');
      if (row.time_30plus) results.push('30+p');
    } else if (type === 'funkcio') {
      // Combine all function fields if non-empty
      const funcs = [row.func1, row.func2, row.func3].map(f => f.trim()).filter(f => f);
      results.push(...funcs);
    }
    return results;
  }

  // 8) Show dialog with full details
  function openDialog(row, tableState) {
    tableState.dialogItem.value = row;
    tableState.showDialog.value = true;
  }

  // 9) Mount the Vue + Vuetify app
  function mountApp() {
    console.log('Mounting Vue app...');
    try {
      const app = createApp({
        setup() {
          const filters = buildFilters();
          const tableState = buildTable();
          const loading = ref(true);

          function applyFilters() {
            console.log('applyFilters triggered');
            filterData(filters, tableState);
          }

          onMounted(() => {
            console.log('Component mounted!');
            fetchData(tableState.allRows, applyFilters, loading);
          });

          return {
            filters, tableState, loading,
            applyFilters,
            clearAllFilters: () => clearAllFilters(filters, applyFilters),
            buildTagList,
            openDialog: row => openDialog(row, tableState)
          };
        },
        // Use the external template if defined, otherwise provide a fallback
        template: typeof scoutGamesAppTemplate !== 'undefined' 
          ? scoutGamesAppTemplate 
          : `<v-app><v-container><div>Error: Template not loaded.</div></v-container></v-app>`
      });

      const vuetify = Vuetify.createVuetify();
      app.use(vuetify);
      app.mount('#scout-games-app');
      console.log('Vue app mounted successfully!');
    } catch (error) {
      console.error('Error mounting Vue app:', error);
      document.getElementById('scout-games-app').innerHTML = 
        '<div style="color:red;padding:20px;">Error initializing the application. Please try again later or contact the administrator.</div>';
    }
  }

  // 10) Execute
  mountApp();
});
