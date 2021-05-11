<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" v-permission="'merchant:payChannel:page'" clearable placeholder="渠道子类名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.code" v-permission="'merchant:payChannel:page'" clearable placeholder="编号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" v-permission="'merchant:payChannel:page'" placeholder="状态" clearable style="width: 90px" class="filter-item">
        <el-option key="1" label="启用" value="1" />
        <el-option key="0" label="停用" value="0" />
      </el-select>
      <el-button v-waves v-permission="'merchant:payChannel:page'" class="filter-item" type="info" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button v-permission="'merchant:payChannel:add'" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
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
      <el-table-column label="名称" align="center">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="编号" align="center">
        <template slot-scope="scope">
          {{ scope.row.code }}
        </template>
      </el-table-column>
      <el-table-column label="下单网关" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          {{ scope.row.createUrl }}
        </template>
      </el-table-column>
      <el-table-column label="通知地址" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          {{ scope.row.notifyUrl }}
        </template>
      </el-table-column>
      <el-table-column label="支付类型" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          {{ scope.row.payTypeInfo }}
        </template>
      </el-table-column>
      <el-table-column label="费率" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          {{ scope.row.costRate }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusTypeFilter">{{ scope.row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160" align="center">
        <template slot-scope="scope">
          {{ scope.row.createTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="135" fixed="right">
        <template slot-scope="scope">
          <el-button v-permission="'merchant:payChannel:edit'" type="text" style="color: #67c23a;" @click="handleupdate(scope.row)">修改</el-button>
          <el-button v-permission="'merchant:channelRisk:listByChannel'" type="text" style="color: #e6a23c;" @click="handlerRisk(scope.row.id)">风控</el-button>
          <el-button v-permission="'merchant:channelRisk:remove'" type="text" style="color: #f56c6c;" @click="deleteData(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 80%; margin-left:50px;">
        <el-form-item label="渠道主类">
          <el-select v-model="temp.categoryIds" style="width:100%" multiple placeholder="请选择渠道主类">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name + '【' + item.code +'】'"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" placeholder="名称" />
        </el-form-item>
        <el-form-item label="编号" prop="code">
          <el-input v-model="temp.code" placeholder="编号" />
        </el-form-item>
        <el-form-item label="下单网关" prop="createUrl">
          <el-input v-model="temp.createUrl" placeholder="订单下单网关" />
        </el-form-item>
        <el-form-item label="查询网关" prop="queryUrl">
          <el-input v-model="temp.queryUrl" placeholder="订单查询网关" />
        </el-form-item>
        <el-form-item label="通知地址" prop="notifyUrl">
          <el-input v-model="temp.notifyUrl" placeholder="通知地址" />
        </el-form-item>
        <el-form-item label="支付类型" prop="payTypeInfo">
          <el-input v-model="temp.payTypeInfo" placeholder="支付类型" />
        </el-form-item>
        <el-form-item label="逻辑标识" prop="logicalTag">
          <el-input v-model="temp.logicalTag" placeholder="逻辑标识" />
        </el-form-item>
        <el-form-item label="费率" prop="costRate">
          <el-input v-model="temp.costRate" placeholder="费率" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="temp.status">
            <el-radio-button :label="1">启用</el-radio-button>
            <el-radio-button :label="0">停用</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="风控" :visible.sync="dialogRiskVisible" width="60%">
      <el-button size="small" style="margin-bottom: 5px;" class="filter-item" type="primary" icon="el-icon-edit" @click="handleRiskCreate">
        新增
      </el-button>
      <el-table
        v-loading="riskLoading"
        :data="riskList"
        element-loading-text="Loading"
        border
        fit
      >
        <el-table-column label="每日最大" align="center">
          <template slot-scope="scope">
            {{ scope.row.dayAmountMax | riskCommonFilter }}
          </template>
        </el-table-column>
        <el-table-column label="单笔最大" align="center">
          <template slot-scope="scope">
            {{ scope.row.oneAmountMax | riskCommonFilter }}
          </template>
        </el-table-column>
        <el-table-column label="单笔最小" align="center">
          <template slot-scope="scope">
            {{ scope.row.oneAmountMin | riskCommonFilter }}
          </template>
        </el-table-column>
        <el-table-column label="单笔金额" align="center" width="80">
          <template slot-scope="scope">
            <template v-if="scope.row.oneAmount">
              <el-tag
                v-for="item in scope.row.oneAmount.split(',')"
                :key="item"
                type="success"
              >{{ item }}</el-tag>
            </template>
            <template v-else>
              {{ scope.row.oneAmount }}
            </template>
          </template>
        </el-table-column>
        <el-table-column property="dayStartTime" label="开始时间" align="center" />
        <el-table-column property="dayEndTime" label="结束时间" align="center" />
        <el-table-column class-name="status-col" label="状态" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status | statusTypeFilter">{{ scope.row.status | statusFilter }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column property="createTime" label="创建时间" align="center" />
        <el-table-column label="操作" align="center" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button v-permission="'merchant:channelRisk:edit'" type="text" style="color: #67c23a;" @click="handleRiskUpdate(scope.row)">修改</el-button>
            <el-button v-permission="'merchant:channelRisk:remove'" type="text" style="color: #f56c6c;" @click="deleteRiskData(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog :title="RiskTextMap[dialogRiskStatus]" :visible.sync="dialogRiskFormVisible" width="40%">
      <el-form ref="riskDataForm" :rules="riskRules" :model="riskTemp" label-position="left" label-width="80px" style="width: 80%; margin-left:50px;">
        <el-form-item label="每日最大" prop="dayAmountMax">
          <el-input v-model="riskTemp.dayAmountMax" placeholder="每日最大限额" />
        </el-form-item>
        <el-form-item label="单笔最大" prop="oneAmountMax">
          <el-input v-model="riskTemp.oneAmountMax" placeholder="单笔最大限额" />
        </el-form-item>
        <el-form-item label="单笔最小" prop="oneAmountMin">
          <el-input v-model="riskTemp.oneAmountMin" placeholder="单笔最小限额" />
        </el-form-item>
        <el-form-item label="单笔金额" prop="oneAmount">
          <el-input v-model="riskTemp.oneAmount" placeholder="指定单笔金额，多个用,分割" />
        </el-form-item>
        <el-form-item label="开始时间" prop="dayStartTime">
          <el-time-picker
            v-model="riskTemp.dayStartTime"
            placeholder="交易开始时间"
            value-format="HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="dayStartTime">
          <el-time-picker
            v-model="riskTemp.dayEndTime"
            placeholder="交易结束时间"
            value-format="HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="riskTemp.status">
            <el-radio-button :label="1">启用</el-radio-button>
            <el-radio-button :label="0">停用</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogRiskFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogRiskStatus==='create'?createRiskData():updateRiskData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { page, add, edit, remove } from '@/api/payChannel'
import { list } from '@/api/payCategory'
import { listByChannel, riskAdd, riskEdit, riskRemove } from '@/api/channelRisk'
import { getByChannel } from '@/api/payCategoryChannel'
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: '启用',
        0: '停用'
      }
      return statusMap[status]
    },
    statusTypeFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'danger'
      }
      return statusMap[status]
    },
    riskCommonFilter(val) {
      console.log(val)
      if (val === '-1') {
        return '不限额'
      } else {
        return val
      }
    }
  },
  data() {
    return {
      textMap: {
        update: '修改',
        create: '新增'
      },
      RiskTextMap: {
        update: '修改',
        create: '新增'
      },
      dialogFormVisible: false,
      dialogRiskFormVisible: false,
      dialogRiskVisible: false,
      riskChannelId: undefined,
      dialogStatus: '',
      dialogRiskStatus: '',
      list: undefined,
      listLoading: true,
      riskLoading: true,
      categoryList: undefined,
      riskList: undefined,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        status: undefined,
        name: undefined,
        code: undefined
      },
      temp: {
        id: undefined,
        name: undefined,
        status: undefined,
        code: undefined,
        createUrl: undefined,
        queryUrl: undefined,
        notifyUrl: undefined,
        payTypeInfo: undefined,
        logicalTag: undefined,
        costRate: undefined,
        categoryIds: undefined
      },
      riskTemp: {
        id: undefined,
        channelId: undefined,
        dayAmountMax: undefined,
        oneAmountMax: undefined,
        oneAmountMin: undefined,
        oneAmount: undefined,
        dayStartTime: undefined,
        dayEndTime: undefined,
        status: undefined
      },
      rules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
        code: [{ required: true, message: '编号不能为空', trigger: 'blur' }],
        createUrl: [{ required: true, message: '下单网关不能为空', trigger: 'blur' }],
        logicalTag: [{ required: true, message: '逻辑标识不能为空', trigger: 'blur' }],
        costRate: [{ required: true, message: '费率不能为空', trigger: 'blur' }]
      },
      riskRules: {
        dayAmountMax: [{ required: true, message: '每日最大限额不能为空，-1表示不限额', trigger: 'blur' }],
        oneAmountMax: [{ required: true, message: '单笔最大限额不能为空，-1表示不限额', trigger: 'blur' }],
        oneAmountMin: [{ required: true, message: '单笔最小限额不能为空，-1表示不限额', trigger: 'blur' }],
        dayStartTime: [{ required: true, message: '交易开始时间不能为空', trigger: 'blur' }],
        dayEndTime: [{ required: true, message: '交易结束时间不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchData()
    this.getCategoryData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      page(this.listQuery.page, this.listQuery.limit, this.listQuery.status, this.listQuery.name ? this.listQuery.name : undefined, this.listQuery.code ? this.listQuery.code : undefined).then(response => {
        if (response.data) {
          this.list = response.data.list
        }
        this.total = response.data.total
        this.listLoading = false
      })
    },
    getCategoryData() {
      list().then(response => {
        this.categoryList = response.data
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: undefined,
        status: 1,
        code: undefined,
        createUrl: undefined,
        queryUrl: undefined,
        notifyUrl: undefined,
        payTypeInfo: undefined,
        logicalTag: undefined,
        costRate: undefined,
        categoryIds: undefined
      }
    },
    setCategoryIds(id) {
      getByChannel(id).then(response => {
        if (response.data) {
          this.temp.categoryIds = response.data
        }
      })
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    setUpdateTemp(row) {
      this.temp.id = row.id
      this.temp.name = row.name
      this.temp.status = row.status
      this.temp.code = row.code
      this.temp.createUrl = row.createUrl
      this.temp.queryUrl = row.queryUrl
      this.temp.notifyUrl = row.notifyUrl
      this.temp.payTypeInfo = row.payTypeInfo
      this.temp.logicalTag = row.logicalTag
      this.temp.costRate = row.costRate
      this.temp.categoryIds = undefined
    },
    handleupdate(row) {
      this.setUpdateTemp(row)
      this.setCategoryIds(this.temp.id)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    resetRiskTemp() {
      this.riskTemp.id = undefined
      this.riskTemp.channelId = this.riskChannelId
      this.riskTemp.dayAmountMax = undefined
      this.riskTemp.oneAmountMax = undefined
      this.riskTemp.oneAmountMin = undefined
      this.riskTemp.oneAmount = undefined
      this.riskTemp.dayStartTime = undefined
      this.riskTemp.dayEndTime = undefined
      this.riskTemp.status = 1
    },
    setRiskUpdateTemp(row) {
      this.riskTemp.id = row.id
      this.riskTemp.channelId = row.channelId
      this.riskTemp.dayAmountMax = row.dayAmountMax
      this.riskTemp.oneAmountMax = row.oneAmountMax
      this.riskTemp.oneAmountMin = row.oneAmountMin
      this.riskTemp.oneAmount = row.oneAmount
      this.riskTemp.dayStartTime = row.dayStartTime
      this.riskTemp.dayEndTime = row.dayEndTime
      this.riskTemp.status = row.status
    },
    handleRiskCreate() {
      this.resetRiskTemp()
      this.dialogRiskStatus = 'create'
      this.dialogRiskFormVisible = true
      this.$nextTick(() => {
        this.$refs['riskDataForm'].clearValidate()
      })
    },
    handleRiskUpdate(row) {
      this.setRiskUpdateTemp(row)
      this.dialogRiskStatus = 'update'
      this.dialogRiskFormVisible = true
      this.$nextTick(() => {
        this.$refs['riskDataForm'].clearValidate()
      })
    },
    createRiskData() {
      console.log(this.riskTemp)
      this.$refs['riskDataForm'].validate((valid) => {
        if (valid) {
          riskAdd(this.riskTemp).then(response => {
            if (response.code === 0) {
              this.dialogRiskFormVisible = false
              this.handlerRisk(this.riskChannelId)
              this.$message({
                type: 'success',
                message: '新增成功!'
              })
            }
          })
        }
      })
    },
    updateRiskData() {
      this.$refs['riskDataForm'].validate((valid) => {
        if (valid) {
          riskEdit(this.riskTemp).then(response => {
            if (response.code === 0) {
              this.dialogRiskFormVisible = false
              this.handlerRisk(this.riskChannelId)
              this.$message({
                type: 'success',
                message: '修改成功!'
              })
            }
          })
        }
      })
    },
    deleteRiskData(id) {
      this.$confirm('确定删除该风控吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        riskRemove(id).then(response => {
          if (response.code === 0) {
            this.handlerRisk(this.riskChannelId)
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }
        })
      }).catch(() => {
      })
    },
    handlerRisk(id) {
      this.riskLoading = true
      this.dialogRiskVisible = true
      this.riskChannelId = id
      listByChannel(id).then(response => {
        this.riskList = response.data
        this.riskLoading = false
      })
    },
    createData() {
      console.log(this.temp)
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          add(this.temp).then(response => {
            if (response.code === 0) {
              this.dialogFormVisible = false
              this.fetchData()
              this.$message({
                type: 'success',
                message: '新增成功!'
              })
            }
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          edit(this.temp).then(response => {
            if (response.code === 0) {
              this.dialogFormVisible = false
              this.fetchData()
              this.$message({
                type: 'success',
                message: '修改成功!'
              })
            }
          })
        }
      })
    },
    deleteData(id) {
      this.$confirm('确定删除该渠道主类吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        remove(id).then(response => {
          if (response.code === 0) {
            this.fetchData()
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }
        })
      }).catch(() => {
      })
    }
  }
}
</script>
