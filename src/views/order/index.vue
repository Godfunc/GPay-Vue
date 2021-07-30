<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" v-permission="'merchant:order:page'" clearable placeholder="名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.outTradeNo" v-permission="'merchant:order:page'" clearable placeholder="商户单号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.orderNo" v-permission="'merchant:order:page'" clearable placeholder="平台单号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.payType" v-permission="'merchant:order:page'" clearable placeholder="支付类型" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" v-permission="'merchant:order:page'" placeholder="状态" clearable style="width: 90px" class="filter-item">
        <el-option key="1" label="已下单" value="1" />
        <el-option key="2" label="已扫码" value="2" />
        <el-option key="3" label="已支付" value="3" />
        <el-option key="4" label="已完成" value="4" />
        <el-option key="5" label="订单失败" value="5" />
        <el-option key="6" label="订单取消" value="6" />
      </el-select>
      <el-button v-waves v-permission="'merchant:order:page'" class="filter-item" type="info" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
    >
      <el-table-column align="center" label="#" width="50">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="商户" align="left" width="200">
        <template slot-scope="scope">
          商户名：{{ scope.row.merchantName }} <br>
          商户号：{{ scope.row.merchantCode }}
        </template>
      </el-table-column>
      <el-table-column label="单号" align="left" :show-overflow-tooltip="true" width="200">
        <template slot-scope="scope">
          商户单号：{{ scope.row.outTradeNo }} <br>
          平台单号：{{ scope.row.orderNo }}<br>
          上游单号：{{ scope.row.tradeNo }}
        </template>
      </el-table-column>
      <el-table-column label="渠道" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          {{ scope.row.channelAccountCode }}
        </template>
      </el-table-column>
      <el-table-column label="支付类型" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          {{ scope.row.payType }}
        </template>
      </el-table-column>
      <el-table-column label="金额" align="center">
        <template slot-scope="scope">
          订单金额：{{ scope.row.amount }}<br>
          实际金额：{{ scope.row.realAmount }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="85">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusTypeFilter">  {{ scope.row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="200" align="center">
        <template slot-scope="scope">
          创建：{{ scope.row.createTime }}<br>
          下单：{{ scope.row.clientCreateTime }}<br>
          支付：{{ scope.row.payTime }}<br>
          通知：{{ scope.row.notifyTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="135" fixed="right">
        <template slot-scope="scope">
          <el-button v-permission="'merchant:order:updatePaid'" style="color: #67c23a;" type="text" @click="handlePaid(scope.row)">补单</el-button>
          <el-button v-permission="'merchant:order:notify'" type="text" style="color: #e6a23c;" @click="handleNotifyMerchant(scope.row)">通知</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />
  </div>
</template>

<script>
import { page, updatePaid, notifyMerchant } from '@/api/order'
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
    statusTypeFilter(status) {
      const statusMap = {
        1: '',
        2: '',
        3: '',
        4: 'success',
        5: 'warning',
        6: 'danger'
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
        payType: undefined,
        outTradeNo: undefined,
        orderNo: undefined,
        createTime: undefined
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      page(this.listQuery.page, this.listQuery.limit, this.listQuery.status,
        this.listQuery.payType ? this.listQuery.payType : undefined,
        this.listQuery.outTradeNo ? this.listQuery.outTradeNo : undefined,
        this.listQuery.orderNo ? this.listQuery.orderNo : undefined,
        this.listQuery.createTime ? this.listQuery.createTime : undefined).then(response => {
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
    },
    handlePaid(row) {
      this.$confirm('确定进行补单吗？')
        .then(_ => {
          updatePaid(row.id).then(response => {
            if (response.code === 0) {
              this.fetchData()
            }
          })
        })
        .catch(_ => {})
    },
    handleNotifyMerchant(row) {
      this.$confirm('确定通知商户吗？')
        .then(_ => {
          notifyMerchant(row.id).then(response => {
            if (response.code === 0) {
              this.fetchData()
            }
          })
        })
        .catch(_ => {})
    }

  }
}
</script>
