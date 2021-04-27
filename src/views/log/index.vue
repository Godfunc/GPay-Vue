<template>
  <div class="app-container">
    <div v-permission="'mg:log:page'" class="filter-container">
      <el-input v-model="listQuery.operation" clearable placeholder="操作" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 90px" class="filter-item">
        <el-option key="1" label="成功" value="1" />
        <el-option key="0" label="失败" value="0" />
      </el-select>
      <el-button v-waves class="filter-item" type="info" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="#" width="50">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template slot-scope="scope">
          {{ scope.row.operation }}
        </template>
      </el-table-column>
      <el-table-column label="请求地址" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.requestUrl }}</span>
        </template>
      </el-table-column>
      <el-table-column label="请求参数" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          {{ scope.row.requestParams }}
        </template>
      </el-table-column>
      <el-table-column label="ip" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          {{ scope.row.ip }}
        </template>
      </el-table-column>
      <el-table-column label="UA" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          {{ scope.row.userAgent }}
        </template>
      </el-table-column>
      <el-table-column label="操作用户" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.createUser }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="请求结果" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusTypeFilter">{{ scope.row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="请求时间" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.requestTime }} 毫秒</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

  </div>
</template>

<script>
import { page } from '@/api/log'
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: '成功',
        0: '失败'
      }
      return statusMap[status]
    },
    statusTypeFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: undefined,
      listLoading: true,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        status: undefined,
        operation: undefined
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      page(this.listQuery.page, this.listQuery.limit, this.listQuery.status, this.listQuery.operation ? this.listQuery.operation : undefined).then(response => {
        if (response.data) {
          this.list = response.data.list
        }
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    }
  }
}
</script>
