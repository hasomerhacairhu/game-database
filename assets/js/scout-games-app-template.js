const scoutGamesAppTemplate = `
<v-app>
  <v-container>
    <!-- Loading indicator -->
    <div v-if="loading" class="text-center my-4">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
      <div class="mt-2">Játékok betöltése...</div>
    </div>
    <div v-else>
      <!-- Main filter row -->
      <v-row class="mb-4">
        <v-col cols="12" sm="8" md="6">
          <v-text-field
            v-model="filters.textSearch.value"
            label="Keresés a játékokban"
            variant="outlined"
            density="compact"
            clearable
            @input="applyFilters"
            prepend-inner-icon="mdi-magnify"
          ></v-text-field>
        </v-col>
        <v-col cols="12" sm="4" md="6" class="d-flex align-center justify-end">
          <v-btn @click="clearAllFilters" variant="outlined" color="primary">
            Szűrők törlése
          </v-btn>
        </v-col>
      </v-row>
      <!-- New row: multi-select filters -->
      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-select
            v-model="filters.terSelect.value"
            :items="['Kültéri', 'Beltéri']"
            label="Tér"
            multiple
            clearable
            @change="applyFilters"
          ></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="filters.csoportSelect.value"
            :items="['Alakulás', 'Viharzás', 'Normázás', 'Működés']"
            label="Csoport"
            multiple
            clearable
            @change="applyFilters"
          ></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="filters.ageSelect.value"
            :items="['0-5', '6-10', '11-13', '14-16', '17+']"
            label="Korosztály"
            multiple
            clearable
            @change="applyFilters"
          ></v-select>
        </v-col>
      </v-row>
      <!-- New row: additional multi-select filters -->
      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-select
            v-model="filters.letszamSelect.value"
            :items="['3-5', '6-15', '16-30', '30+']"
            label="Létszám"
            multiple
            clearable
            @change="applyFilters"
          ></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="filters.funkcioSelect.value"
            :items="['Option1', 'Option2', 'Option3']"
            label="Funkciók"
            multiple
            clearable
            @change="applyFilters"
          ></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="filters.idoSelect.value"
            :items="['3-10p', '11-20p', '21-30p', '30+p']"
            label="Időtartam"
            multiple
            clearable
            @change="applyFilters"
          ></v-select>
        </v-col>
      </v-row>
      
      <!-- Results count -->
      <div class="text-subtitle-1 my-2">
        {{ tableState.filteredRows.value.length }} játék található
      </div>
      
      <!-- Data table -->
      <v-data-table
        :items="tableState.filteredRows.value"
        :headers="[
          {title: 'Játék neve', key: 'name', width: '40%'},
          {title: 'Cél', key: 'objective', width: '60%'}
        ]"
        class="elevation-1"
        hover
      >
        <template v-slot:item="{ item }">
          <tr @click="openDialog(item)" style="cursor: pointer">
            <td>{{ item.name }}</td>
            <td>{{ item.objective }}</td>
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
            <v-chip-group class="mt-4">
              <template v-for="tag in buildTagList(tableState.dialogItem.value, 'ter')">
                <v-chip color="primary" size="small" class="mr-1">{{ tag }}</v-chip>
              </template>
              <template v-for="tag in buildTagList(tableState.dialogItem.value, 'csoport')">
                <v-chip color="success" size="small" class="mr-1">{{ tag }}</v-chip>
              </template>
              <template v-for="tag in buildTagList(tableState.dialogItem.value, 'age')">
                <v-chip color="warning" size="small" class="mr-1">{{ tag }}</v-chip>
              </template>
              <!-- Additional tags (e.g., Létszám, Időtartam) if desired -->
            </v-chip-group>
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
