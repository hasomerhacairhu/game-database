const scoutGamesAppTemplate = `
<v-app>
  <v-container>
    <!-- Loading indicator -->
    <div v-if="loading" class="text-center my-4">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
      <div class="mt-2">Játékok betöltése...</div>
    </div>
    <div v-else>
      <!-- Row 1: Global search and Funkciók -->
      <v-row dense class="mb-4">
        <v-col cols="4">
          <v-text-field
            v-model="filters.textSearch.value"
            label="Keresés a játékokban"
            variant="outlined"
            density="compact"
            clearable
            @input="applyFilters"
            prepend-inner-icon="mdi-magnify"
            style="width: 100%;"
          ></v-text-field>
        </v-col>
        <v-col cols="8">
          <v-select
            v-model="filters.funkcioSelect.value"
            :items="[
              'Névtanulós gyakorlatok',
              'Ismerkedős gyakorlatok',
              'Közösségfejlesztő gyakorlatok',
              'Testkontaktus gyakorlatok',
              'Bizalomerősítő gyakorlatok',
              'Empátia gyakorlatok/Érzelmi intelligencia fejlesztő gyakorlatok',
              'Önismereti gyakorlatok',
              'Szituációs játékok',
              'Koncentrációs gyakorlatok',
              'Gondolkodtató gyakorlatok',
              'Mozgás-verseny',
              'Időtöltő játékok',
              'Ugratós játékok',
              'Játékok vetélkedőhöz',
              'Feszültségoldó'
            ]"
            label="Funkciók"
            multiple
            clearable
            density="compact"
            @update:modelValue="applyFilters"
            style="width: 100%;"
          ></v-select>
        </v-col>
      </v-row>
      <!-- Row 2: Tér, Csoport, Korosztály, Létszám, Időtartam, Clear -->
      <v-row dense class="mb-4">
        <v-col cols="2">
          <v-select
            v-model="filters.terSelect.value"
            :items="['Kültéri', 'Beltéri']"
            label="Tér"
            multiple
            clearable
            density="compact"
            @update:modelValue="applyFilters"
            style="width: 100%;"
          ></v-select>
        </v-col>
        <v-col cols="2">
          <v-select
            v-model="filters.csoportSelect.value"
            :items="['Alakulás', 'Viharzás', 'Normázás', 'Működés']"
            label="Csoport"
            multiple
            clearable
            density="compact"
            @update:modelValue="applyFilters"
            style="width: 100%;"
          ></v-select>
        </v-col>
        <v-col cols="2">
          <v-select
            v-model="filters.ageSelect.value"
            :items="['0-5', '6-10', '11-13', '14-16', '17+']"
            label="Korosztály"
            multiple
            clearable
            density="compact"
            @update:modelValue="applyFilters"
            style="width: 100%;"
          ></v-select>
        </v-col>
        <v-col cols="2">
          <v-select
            v-model="filters.letszamSelect.value"
            :items="['3-5 fő', '6-15 fő', '16-30 fő', '30+ fő']"
            label="Létszám"
            multiple
            clearable
            density="compact"
            @update:modelValue="applyFilters"
            style="width: 100%;"
          ></v-select>
        </v-col>
        <v-col cols="2">
          <v-select
            v-model="filters.idoSelect.value"
            :items="['3-10p', '11-20p', '21-30p', '30+p']"
            label="Időtartam"
            multiple
            clearable
            density="compact"
            @update:modelValue="applyFilters"
            style="width: 100%;"
          ></v-select>
        </v-col>
        <v-col cols="2" class="d-flex align-center">
          <v-btn @click="clearAllFilters" variant="outlined" color="primary" style="width: 100%;">
            Szűrők törlése
          </v-btn>
        </v-col>
      </v-row>
      
      <!-- Results count -->
      <div class="text-subtitle-1 my-2">
        {{ tableState.filteredRows.value.length }} játék található
      </div>
      
      <!-- Data table with external pagination in top slot -->
      <v-data-table
        :items="paginatedRows"
        :headers="[
          { title: 'Játék neve', key: 'name', width: '15%' },
          { title: 'Cél', key: 'objective', width: '30%' },
          { title: 'Tér', key: 'ter', width: '10%' },
          { title: 'Csoport', key: 'csoport', width: '10%' },
          { title: 'Korosztály', key: 'age', width: '15%' },
          { title: 'Létszám', key: 'letszam', width: '10%' },
          { title: 'Időtartam', key: 'time', width: '10%' }
        ]"
        class="elevation-3"
        hover
        hide-default-footer
      >
        <template v-slot:top>
          <v-row align="center">
            <v-col cols="6" class="text-left">
              <v-select
                v-model="itemsPerPage"
                :items="[25, 50, 100]"
                label="Sorok száma/lapon"
                dense
                hide-details
                style="max-width: 150px;"
                @change="page = 1"
              ></v-select>
            </v-col>
            <v-col cols="6" class="text-right">
              <v-pagination
                v-model="page"
                :length="totalPages"
                total-visible="7"
              ></v-pagination>
            </v-col>
          </v-row>
        </template>
        <template v-slot:item="{ item }">
          <tr @click="openDialog(item)" style="cursor: pointer">
            <td>{{ item.name }}</td>
            <td>
              {{ item.objective && item.objective.length > 80 ? item.objective.substring(0,80) + '...' : item.objective }}
            </td>
            <td>
              <span v-for="tag in buildTagList(item, 'ter')" :key="tag" style="display:inline;">
                <v-chip color="primary" text-color="white" size="x-small">{{ tag }}</v-chip>
              </span>
            </td>
            <td>
              <span v-for="tag in buildTagList(item, 'csoport')" :key="tag" style="display:inline;">
                <v-chip color="success" text-color="white" size="x-small">{{ tag }}</v-chip>
              </span>
            </td>
            <td>
              <span v-for="tag in buildTagList(item, 'age')" :key="tag" style="display:inline;">
                <v-chip color="warning" text-color="white" size="x-small">{{ tag }}</v-chip>
              </span>
            </td>
            <td>
              <span v-for="tag in buildTagList(item, 'letszam')" :key="tag" style="display:inline;">
                <v-chip color="info" text-color="white" size="x-small">{{ tag }}</v-chip>
              </span>
            </td>
            <td>
              <span v-for="tag in buildTagList(item, 'time')" :key="tag" style="display:inline;">
                <v-chip color="error" text-color="white" size="x-small">{{ tag }}</v-chip>
              </span>
            </td>
          </tr>
        </template>
      </v-data-table>
      
      <!-- Detail dialog -->
      <v-dialog v-model="tableState.showDialog.value" max-width="700px">
        <v-card v-if="tableState.dialogItem.value">
          <v-card-title>{{ tableState.dialogItem.value.name }}</v-card-title>
          <v-card-text>
            <div v-if="tableState.dialogItem.value.alternative">
              <strong>Más néven:</strong> {{ tableState.dialogItem.value.alternative }}
            </div>
            <div class="my-2">
              <strong>Játék célja:</strong> {{ tableState.dialogItem.value.objective }}
            </div>
            <div class="my-2">
              <strong>Szabályok:</strong> {{ tableState.dialogItem.value.rules }}
            </div>
            <div class="my-2" v-if="tableState.dialogItem.value.tools">
              <strong>Kellékek:</strong> {{ tableState.dialogItem.value.tools }}
            </div>
            <!-- New layout for properties with labels -->
            <v-row dense class="mt-4" v-if="buildTagList(tableState.dialogItem.value, 'ter').length">
              <v-col cols="4"><strong>Tér:</strong></v-col>
              <v-col cols="8">
                <span v-for="tag in buildTagList(tableState.dialogItem.value, 'ter')" :key="tag" style="margin-right:4px;">
                  <v-chip color="primary" text-color="white" size="x-small">{{ tag }}</v-chip>
                </span>
              </v-col>
            </v-row>
            <v-row dense class="mt-2" v-if="buildTagList(tableState.dialogItem.value, 'csoport').length">
              <v-col cols="4"><strong>Csoport:</strong></v-col>
              <v-col cols="8">
                <span v-for="tag in buildTagList(tableState.dialogItem.value, 'csoport')" :key="tag" style="margin-right:4px;">
                  <v-chip color="success" text-color="white" size="x-small">{{ tag }}</v-chip>
                </span>
              </v-col>
            </v-row>
            <v-row dense class="mt-2" v-if="buildTagList(tableState.dialogItem.value, 'age').length">
              <v-col cols="4"><strong>Korosztály:</strong></v-col>
              <v-col cols="8">
                <span v-for="tag in buildTagList(tableState.dialogItem.value, 'age')" :key="tag" style="margin-right:4px;">
                  <v-chip color="warning" text-color="white" size="x-small">{{ tag }}</v-chip>
                </span>
              </v-col>
            </v-row>
            <!-- New rows for additional properties -->
            <v-row dense class="mt-2" v-if="buildTagList(tableState.dialogItem.value, 'letszam').length">
              <v-col cols="4"><strong>Létszám:</strong></v-col>
              <v-col cols="8">
                <span v-for="tag in buildTagList(tableState.dialogItem.value, 'letszam')" :key="tag" style="margin-right:4px;">
                  <v-chip color="info" text-color="white" size="x-small">{{ tag }}</v-chip>
                </span>
              </v-col>
            </v-row>
            <v-row dense class="mt-2" v-if="buildTagList(tableState.dialogItem.value, 'time').length">
              <v-col cols="4"><strong>Időtartam:</strong></v-col>
              <v-col cols="8">
                <span v-for="tag in buildTagList(tableState.dialogItem.value, 'time')" :key="tag" style="margin-right:4px;">
                  <v-chip color="error" text-color="white" size="x-small">{{ tag }}</v-chip>
                </span>
              </v-col>
            </v-row>
            <v-row dense class="mt-2" v-if="buildTagList(tableState.dialogItem.value, 'funkcio').length">
              <v-col cols="4"><strong>Funkció:</strong></v-col>
              <v-col cols="8">
                <span v-for="tag in buildTagList(tableState.dialogItem.value, 'funkcio')" :key="tag" style="margin-right:4px;">
                  <v-chip color="secondary" text-color="white" size="x-small">{{ tag }}</v-chip>
                </span>
              </v-col>
            </v-row>
            <!-- Forrás row -->
            <v-row dense class="mt-2" v-if="tableState.dialogItem.value.source">
              <v-col cols="4"><strong>Forrás:</strong></v-col>
              <v-col cols="8">
                <a :href="tableState.dialogItem.value.source" target="_blank" style="text-decoration: none;">
                  <v-icon small>mdi-open-in-new</v-icon>
                </a>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="tableState.showDialog.value = false">Bezárás</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</v-app>
`;
