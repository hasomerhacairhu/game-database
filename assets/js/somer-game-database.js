jQuery(document).ready(function($) {
    var table; // Declare table variable in the outer scope
    
    // Helper functions first
    function debugFilters(rowData) {
        console.group('Filter Debug');
        console.log('Tér filters:', $('#filter-ter').val());
        console.log('Csoport filters:', $('#filter-csoport').val());
        console.log('Korosztály filters:', $('#filter-korosztaly').val());
        console.log('Funkció filters:', $('#filter-funkcio').val());
        console.log('Létszám filters:', $('#filter-letszam').val());
        console.log('Időtartam filters:', $('#filter-idotartam').val());
        console.log('Row data:', rowData);
        console.groupEnd();
    }
    function truncateText(text, maxLength = 30) {
        if (!text) return "";
        return text.length > maxLength ? '<span title="'+text+'">' + text.substring(0, maxLength) + '...</span>' : text;
    }
    function renderForras(data) {
        return data && data.trim() !== "" ? '<a href="'+data.trim()+'" target="_blank" rel="noopener noreferrer">🔗</a>' : "";
    }
    function renderBoolGroup(row, mappings) {
        var labels = [];
        mappings.forEach(function(mapping) {
            if(String(row[mapping.col]).toLowerCase() === "true") {
                labels.push('<span class="tag">' + mapping.label + '</span>');
            }
        });
        return labels.join('<br>');
    }
    function renderFunkcio(row) {
        var funcs = [];
        // Use correct columns R, S, T (indices 17, 18, 19)
        [17, 18, 19].forEach(function(idx) {
            if(row[idx] && row[idx].trim() !== "") {
                funcs.push('<span class="tag">' + row[idx].trim() + '</span>');
            }
        });
        return funcs.join('<br>');
    }
    function buildBasicInfo(rowData) {
        var html = '<table class="info-table">';
        // Columns A-F (indices 0-5)
        html += '<tr><td class="cell-padding cell-label">Játék neve:</td><td class="cell-padding">' + rowData[0] + '</td></tr>';
        html += '<tr><td class="cell-padding cell-label">Játék további elnevezései:</td><td class="cell-padding">' + rowData[1] + '</td></tr>';
        html += '<tr><td class="cell-padding cell-label">Forrásmegjelölés:</td><td class="cell-padding">' + renderForras(rowData[5]) + '</td></tr>';
        html += '<tr><td class="cell-padding cell-label">Szükséges kellékek:</td><td class="cell-padding">' + rowData[4] + '</td></tr>';
        html += '</table>';
        return html;
    }
    function buildCategories(rowData) {
        var html = '<table style="width:100%; border-collapse:collapse;">';
        // Columns G-H (indices 6-7)
        html += '<tr><td style="padding:4px; font-weight:bold;">Tér:</td><td style="padding:4px;">' + renderBoolGroup(rowData, [
            {col: 6, label:"Kültéren játszható"},
            {col: 7, label:"Beltéren játszható"}
        ]) + '</td></tr>';
        // Columns I-L (indices 8-11)
        html += '<tr><td style="padding:4px; font-weight:bold;">Csoportdinamikai fázis:</td><td style="padding:4px;">' + renderBoolGroup(rowData, [
            {col: 8, label:"Alakulás"},
            {col: 9, label:"Viharzás"},
            {col: 10, label:"Normázás"},
            {col: 11, label:"Működés"}
        ]) + '</td></tr>';
        // Columns M-Q (indices 12-16)
        html += '<tr><td style="padding:4px; font-weight:bold;">Korosztály:</td><td style="padding:4px;">' + renderBoolGroup(rowData, [
            {col: 12, label:"0-5"},
            {col: 13, label:"6-10"},
            {col: 14, label:"11-13"},
            {col: 15, label:"14-16"},
            {col: 16, label:"17+"}
        ]) + '</td></tr>';
        // Columns R-T (indices 17-19)
        html += '<tr><td style="padding:4px; font-weight:bold;">Funkció:</td><td style="padding:4px;">' + renderFunkcio(rowData) + '</td></tr>';
        // Columns U-X (indices 20-23)
        html += '<tr><td style="padding:4px; font-weight:bold;">Létszám:</td><td style="padding:4px;">' + renderBoolGroup(rowData, [
            {col: 20, label:"kis csoport 3-5 fő"},
            {col: 21, label:"közepes csoport 6-15 fő"},
            {col: 22, label:"nagy csoport 16-30 fő"},
            {col: 23, label:"közösség 30+ fő"}
        ]) + '</td></tr>';
        // Columns Y-AB (indices 24-27)
        html += '<tr><td style="padding:4px; font-weight:bold;">Időtartam:</td><td style="padding:4px;">' + renderBoolGroup(rowData, [
            {col: 24, label:"3-10p"},
            {col: 25, label:"11-20p"},
            {col: 26, label:"21-30p"},
            {col: 27, label:"30+p"}
        ]) + '</td></tr>';
        html += '</table>';
        return html;
    }
    function buildDescription(rowData) {
        var html = '<table style="width:100%; border-collapse:collapse;">';
        html += '<tr><td style="padding:4px; font-weight:bold;">Gyakorlat célja:</td></tr>';
        html += '<tr><td style="padding:4px;">' + rowData[2] + '</td></tr>';
        html += '<tr><td style="padding:4px; margin-top:16px; font-weight:bold;">Játékszabály leírása:</td></tr>';
        html += '<tr><td style="padding:4px;">' + rowData[3] + '</td></tr>';
        html += '</table>';
        return html;
    }

    // Custom filtering function
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex, rowData) {
        // Debug first row only to avoid console spam
        if(dataIndex === 0) {
            debugFilters(rowData);
        }
        
        // Include alternative names in global search
        var globalText = $('#globalTextSearch').val().toLowerCase();
        if(globalText) {
            var searchStr = (rowData[0] + " " + rowData[1] + " " + rowData[2] +  " " + rowData[3] + " " + rowData[17] + " " + rowData[18] + " " + rowData[19]).toLowerCase();
            if(searchStr.indexOf(globalText) === -1) return false;
        }
        
        // Tér filter
        var terFilters = $('#filter-ter').val() || [];
        if(terFilters.length > 0) {
            var terMatch = false;
            terFilters.forEach(function(val) {
                if(val === "Kültéri" && String(rowData[6]).toLowerCase() === "true") terMatch = true;
                if(val === "Beltéri" && String(rowData[7]).toLowerCase() === "true") terMatch = true;
            });
            if(!terMatch) return false;
        }
        
        // Csoportdinamikai filter
        var csoportFilters = $('#filter-csoport').val() || [];
        if(csoportFilters.length > 0) {
            var csoportMatch = false;
            csoportFilters.forEach(function(val) {
                if(val === "Alakulás" && String(rowData[8]).toLowerCase() === "true") csoportMatch = true;
                if(val === "Viharzás" && String(rowData[9]).toLowerCase() === "true") csoportMatch = true;
                if(val === "Normázás" && String(rowData[10]).toLowerCase() === "true") csoportMatch = true;
                if(val === "Működés" && String(rowData[11]).toLowerCase() === "true") csoportMatch = true;
            });
            if(!csoportMatch) return false;
        }
        
        // Korosztály filter
        var korFilters = $('#filter-korosztaly').val() || [];
        if(korFilters.length > 0) {
            var korMatch = false;
            korFilters.forEach(function(val) {
                if(val === "0-5" && String(rowData[12]).toLowerCase() === "true") korMatch = true;
                if(val === "6-10" && String(rowData[13]).toLowerCase() === "true") korMatch = true;
                if(val === "11-13" && String(rowData[14]).toLowerCase() === "true") korMatch = true;
                if(val === "14-16" && String(rowData[15]).toLowerCase() === "true") korMatch = true;
                if(val === "17+" && String(rowData[16]).toLowerCase() === "true") korMatch = true;
            });
            if(!korMatch) return false;
        }
        
        // Funkció filter
        var funkcioFilters = $('#filter-funkcio').val() || [];
        if(funkcioFilters.length > 0) {
            var funkMatch = false;
            funkcioFilters.forEach(function(val) {
                [17,18,19].forEach(function(idx) {
                    if(rowData[idx] && rowData[idx].toLowerCase().indexOf(val.toLowerCase()) !== -1) {
                        funkMatch = true;
                    }
                });
            });
            if(!funkMatch) return false;
        }
        
        // Létszám filter
        var letszamFilters = $('#filter-letszam').val() || [];
        if(letszamFilters.length > 0) {
            var letszamMatch = false;
            letszamFilters.forEach(function(val) {
                if(val === "kis csoport 3-5 fő" && String(rowData[20]).toLowerCase() === "true") letszamMatch = true;
                if(val === "közepes csoport 6-15 fő" && String(rowData[21]).toLowerCase() === "true") letszamMatch = true;
                if(val === "nagy csoport 16-30 fő" && String(rowData[22]).toLowerCase() === "true") letszamMatch = true;
                if(val === "közösség 30+ fő" && String(rowData[23]).toLowerCase() === "true") letszamMatch = true;
            });
            if(!letszamMatch) return false;
        }
        
        // Időtartam filter
        var idotartamFilters = $('#filter-idotartam').val() || [];
        if(idotartamFilters.length > 0) {
            var idotartamMatch = false;
            idotartamFilters.forEach(function(val) {
                if(val === "3-10p" && String(rowData[24]).toLowerCase() === "true") idotartamMatch = true;
                if(val === "11-20p" && String(rowData[25]).toLowerCase() === "true") idotartamMatch = true;
                if(val === "21-30p" && String(rowData[26]).toLowerCase() === "true") idotartamMatch = true;
                if(val === "30+p" && String(rowData[27]).toLowerCase() === "true") idotartamMatch = true;
            });
            if(!idotartamMatch) return false;
        }
        
        // // Debug matches
        // if(dataIndex === 0) {
        //     console.group('Match Results');
        //     console.log('Tér match:', terMatch);
        //     console.log('Csoport match:', csoportMatch);
        //     console.log('Korosztály match:', korMatch);
        //     console.log('Funkció match:', funkMatch);
        //     console.log('Létszám match:', letszamMatch);
        //     console.log('Időtartam match:', idotartamMatch);
        //     console.groupEnd();
        // }

        return true;
    });



    // Initialize DataTable first
    Papa.parse("https://docs.google.com/spreadsheets/d/e/2PACX-1vRcx1YPhoi6kUVe36T4T2162AhCdBwuVSX0ou2u-Vlicjf2So3VL3E2MDzrNYIbkgckP4n8p18_UOGP/pub?gid=0&single=true&output=csv", {
        download: true,
        skipEmptyLines: true,
        complete: function(results) {
            var data = results.data.slice(3); // skip header rows

            // Hide loading spinner and show table
            $('#loading-container').hide();
            $('#gamesTable').show();

            // Initialize DataTable
            table = $('#gamesTable').DataTable({
                data: data,
                columns: [
                    { 
                        title: "Játék neve", 
                        render: function(data, type, row) {
                            var mainName = row[0] ? '<div class="game-title">' + truncateText(row[0], 30) + '</div>' : '';
                            var altNames = row[1] ? '<div class="game-subtitle">' + truncateText(row[1], 30) + '</div>' : '';
                            return '<div class="game-name-cell">' + mainName + altNames + '</div>';
                        }
                    },
                    { 
                        title: "Gyakorlat célja",
                        data: 2,
                        render: function(data) { 
                            return '<div class="truncated-text">' + truncateText(data, 120) + '</div>'; 
                        }
                    },
                    { 
                        title: "Tér",
                        render: function(data, type, row) {
                            return renderBoolGroup(row, [
                                {col: 6, label:"Kültéri"},
                                {col: 7, label:"Beltéri"}
                            ]);
                        }
                    },
                    { 
                        title: "Csoportdinamika",
                        render: function(data, type, row) {
                            return renderBoolGroup(row, [
                                {col: 8, label:"Alakulás"},
                                {col: 9, label:"Viharzás"},
                                {col: 10, label:"Normázás"},
                                {col: 11, label:"Működés"}
                            ]);
                        }
                    },
                    { 
                        title: "Korosztály",
                        render: function(data, type, row) {
                            return renderBoolGroup(row, [
                                {col: 12, label:"0-5"},
                                {col: 13, label:"6-10"},
                                {col: 14, label:"11-13"},
                                {col: 15, label:"14-16"},
                                {col: 16, label:"17+"}
                            ]);
                        }
                    },
                    {
                        title: "Funkció",
                        render: function(data, type, row) {
                            return renderFunkcio(row);
                        }
                    },
                    {
                        title: "Létszám",
                        render: function(data, type, row) {
                            return renderBoolGroup(row, [
                                {col: 20, label:"3-5 fő"},
                                {col: 21, label:"6-15 fő"},
                                {col: 22, label:"16-30 fő"},
                                {col: 23, label:"30+ fő"}
                            ]);
                        }
                    },
                    {
                        title: "Időtartam",
                        render: function(data, type, row) {
                            return renderBoolGroup(row, [
                                {col: 24, label:"3-10p"},
                                {col: 25, label:"11-20p"},
                                {col: 26, label:"21-30p"},
                                {col: 27, label:"30+p"}
                            ]);
                        }
                    }
                ],
                pageLength: 50,      // Show 50 entries per page
                searching: true,     // Enable search box
                lengthMenu: [[25, 50, 100, -1], [25, 50, 100, "All"]],  // Page length options
                paging: true, 
                info: true,
                dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rt<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
                classes: {
                    sTable: 'table table-striped table-hover',
                    sPageButton: 'paginate_button page-item',
                    sPageButtonActive: 'active',
                    sPageButtonDisabled: 'disabled'
                },
                language: {
                    "lengthMenu": "_MENU_ játék oldalanként",
                    "zeroRecords": "Nincs találat",
                    "info": "_START_ - _END_ / _TOTAL_ játék",
                    "infoEmpty": "Nincs megjeleníthető játék",
                    "infoFiltered": "(szűrve _MAX_ játékból)",
                    "paginate": {
                        "first": "Első",
                        "last": "Utolsó",
                        "next": "Következő",
                        "previous": "Előző"
                    }
                },
                dom: 'lrtip'       // This removes 'f' (filtering/search box) from the layout
            });

            // Initialize Select2 after table is created
            $('#filter-ter, #filter-csoport, #filter-korosztaly, #filter-funkcio, #filter-letszam, #filter-idotartam').select2({
                theme: 'bootstrap-5',
                width: 'resolve',
                placeholder: "Válassz egyet vagy többet...",
                allowClear: true,
                closeOnSelect: false,
                dropdownParent: $('#scout-games-interface')
            }).on('change', function() {
                table.draw();
            });

            // Set up other event handlers
            $('#globalTextSearch').on('keyup', function() {
                table.draw();
            });

            $('.select2').on('select2:select select2:unselect', function(e) {
                if (e.type === 'select2:unselect') {
                    $(this).on('select2:opening.cancelOpen', function(e) {
                        e.preventDefault();
                        $(this).off('select2:opening.cancelOpen');
                    });
                }
                table.draw();
            });

            // Clear filters button
            $('#clearFilters').click(function() {
                // Clear global text search
                $('#globalTextSearch').val('');
                
                // Clear all Select2 fields properly
                $('#filter-ter, #filter-csoport, #filter-korosztaly, #filter-funkcio, #filter-letszam, #filter-idotartam').each(function() {
                    $(this).val(null).trigger('change');
                });
                
                // Redraw the table
                table.draw();
            });

            // Replace the dialog initialization with Bootstrap modal
            $('#gamesTable tbody').on('click', 'tr', function() {
                var row = table.row(this).data();
                var dialogContent = `
                    <div class="dialog-container">
                        <div class="dialog-column">
                            ${buildBasicInfo(row)}
                        </div>
                        <div class="dialog-column">
                            ${buildCategories(row)}
                        </div>
                    </div>
                    <div class="dialog-section">
                        ${buildDescription(row)}
                    </div>
                `;

                // Update modal content
                $('#gameDetailLabel').text(row[0]);
                $('#detailDialog .modal-body').html(dialogContent);
                
                // Show modal using Bootstrap's API
                const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('detailDialog'));
                modal.show();
            });
        }
    });
});
