<template>
  <div>
    <el-dialog title="日志" :visible.sync="dialogFormVisible" width="55%">
      <el-table :data="list" style="width: 100%">
        <el-table-column prop="oldStatus" label="原状态" align="center" width="90">
          <template slot-scope="scope">
            {{ scope.row.oldStatus | statusFilter }}
          </template>
        </el-table-column>
        <el-table-column prop="oldStatus" label="新状态" align="center" width="90">
          <template slot-scope="scope">
            {{ scope.row.newStatus | statusFilter }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="理由" :show-overflow-tooltip="true" />
        <el-table-column prop="createTime" label="创建时间" :show-overflow-tooltip="true" />
        <el-table-column prop="result" label="结果" align="center" width="90">
          <template slot-scope="scope">
            <el-tag :type="scope.row.result | resultTypeFilter">  {{ scope.row.result | resultFilter }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />
    </el-dialog>
  </div>
</template>

<script>
import { page } from '@/api/orderLog'
import Pagination from '@/components/Pagination'

export default {
  components: {
    Pagination
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: '已下单',
        2: '已扫码',
        3: '已支付',
        4: '已完成',
        5: '订单失败',
        6: '订单取消'
      }
      return statusMap[status]
    },
    resultFilter(result) {
      const resultMap = {
        1: '成功',
        2: '失败'
      }
      return resultMap[result]
    },
    resultTypeFilter(result) {
      const resultMap = {
        1: 'success',
        2: 'danger'
      }
      return resultMap[result]
    }
  },
  data() {
    return {
      orderId: undefined,
      dialogFormVisible: false,
      list: undefined,
      loading: true,
      listLoading: true,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        orderId: undefined
      }
    }
  },
  methods: {
    fetchData() {
      this.listLoading = true
      page(this.listQuery.page, this.listQuery.limit, this.listQuery.orderId).then(response => {
        if (response.data) {
          this.list = response.data.list
        }
        this.total = response.data.total
        this.listLoading = false
      })
    },
    page(orderId) {
      this.listQuery.orderId = orderId
      this.dialogFormVisible = true
      this.fetchData()
    }
  }
}
</script>
