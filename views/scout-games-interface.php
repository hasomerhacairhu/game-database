<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<!-- jQuery (required for DataTables and Select2) -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<!-- Select2 CSS and Bootstrap 5 theme -->
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
<link href="https://cdn.jsdelivr.net/npm/select2-bootstrap-5-theme@1.3.0/dist/select2-bootstrap-5-theme.min.css" rel="stylesheet">

<div id="scout-games-interface" class="container-fluid">
    <!-- Filter Section -->
    <div class="filters-grid">
        <div class="row g-3">
            <!-- Search field -->
            <div class="col-md-6">
                <input type="text" id="globalTextSearch" class="form-control" placeholder="Keresés...">
            </div>
            <!-- Select2 filters -->
            <div class="col-md-3">
                <select id="filter-ter" class="form-select" multiple>
                    <option value="Kültéri">Kültéri</option>
                    <option value="Beltéri">Beltéri</option>
                </select>
            </div>
            <div class="col-md-3">
                <select id="filter-csoport" class="form-select" multiple>
                    <option value="Alakulás">Alakulás</option>
                    <option value="Viharzás">Viharzás</option>
                    <option value="Normázás">Normázás</option>
                    <option value="Működés">Működés</option>
                </select>
            </div>
            <div class="col-md-3">
                <select id="filter-korosztaly" class="form-select" multiple>
                    <option value="0-5">0-5</option>
                    <option value="6-10">6-10</option>
                    <option value="11-13">11-13</option>
                    <option value="14-16">14-16</option>
                    <option value="17+">17+</option>
                </select>
            </div>
            <div class="col-md-3">
                <select id="filter-letszam" class="form-select" multiple>
                    <option value="kis csoport 3-5 fő">kis csoport 3-5 fő</option>
                    <option value="közepes csoport 6-15 fő">közepes csoport 6-15 fő</option>
                    <option value="nagy csoport 16-30 fő">nagy csoport 16-30 fő</option>
                    <option value="közösség 30+ fő">közösség 30+ fő</option>
                </select>
            </div>
            <div class="col-md-3">
                <select id="filter-idotartam" class="form-select" multiple>
                    <option value="3-10p">3-10p</option>
                    <option value="11-20p">11-20p</option>
                    <option value="21-30p">21-30p</option>
                    <option value="30+p">30+p</option>
                </select>
            </div>
            <div class="col-md-3">
                <button id="clearFilters" class="btn btn-outline-secondary w-100">Szűrő törlése</button>
            </div>
        </div>
    </div>

    <!-- Loading spinner -->
    <div id="loading-container" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Betöltés...</span>
        </div>
        <div class="mt-3">Játékok betöltése...</div>
    </div>

    <!-- DataTable -->
    <table id="gamesTable" class="table table-striped" style="width:100%; display:none">
        <thead>
            <tr>
                <th>Játék neve</th>
                <th>Gyakorlat célja</th>
                <th>Tér (Kültéri/Beltéri)</th>
                <th>Csoportdinamika</th>
                <th>Korosztály</th>
                <th>Funkció</th>
                <th>Létszám</th>
                <th>Időtartam</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>

    <!-- Hidden Dialog for Full Details -->
    <div class="modal fade" id="detailDialog" tabindex="-1" aria-labelledby="gameDetailLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="gameDetailLabel"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Add these before closing body tag -->
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
