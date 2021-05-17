<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" v-permission="'merchant:merchant:page'" clearable placeholder="商户名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.code" v-permission="'merchant:merchant:page'" clearable placeholder="商户号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" v-permission="'merchant:merchant:page'" placeholder="状态" clearable style="width: 90px" class="filter-item">
        <el-option key="1" label="启用" value="1" />
        <el-option key="0" label="停用" value="0" />
      </el-select>
      <el-select v-model="listQuery.type" v-permission="'merchant:merchant:page'" placeholder="类型" clearable style="width: 90px" class="filter-item">
        <el-option key="1" label="商户" value="1" />
        <el-option key="2" label="代理" value="2" />
      </el-select>
      <el-button v-waves v-permission="'merchant:merchant:page'" class="filter-item" type="info" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button v-permission="'merchant:merchant:add'" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
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
      <el-table-column label="商户名" align="center">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="编号" align="center">
        <template slot-scope="scope">
          {{ scope.row.code }}
        </template>
      </el-table-column>
      <el-table-column label="类型" width="80" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.type | typeFilter }}</span>
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
      <el-table-column label="修改时间" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          {{ scope.row.updateTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="171" fixed="right">
        <template slot-scope="scope">
          <el-button v-permission="'merchant:merchant:edit'" type="text" style="color: #67c23a;" @click="handleupdate(scope.row)">修改</el-button>
          <el-button v-permission="'merchant:merchant:keys'" type="text" style="color: #409eff;" @click="handleKeys(scope.row)">密钥</el-button>
          <el-button v-permission="'merchant:merchantRisk:list'" type="text" style="color: #e6a23c;" @click="handlerRisk(scope.row.code)">风控</el-button>
          <el-button v-permission="'merchant:merchant:remove'" type="text" style="color: #f56c6c;" @click="deleteData(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 80%; margin-left:50px;">
        <el-form-item label="用户" prop="userId">
          <el-select v-model="temp.userId" no-data-text="请先去【用户管理】创建用户" style="width: 100%" :disabled="dialogStatus == 'update'" placeholder="用户">
            <el-option
              v-for="item in userList"
              :key="item.id"
              :label="item.username"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="代理" prop="agentId">
          <el-select v-model="temp.agentId" style="width: 100%" :disabled="dialogStatus == 'update'" placeholder="请选择代理商户">
            <el-option
              v-for="item in agentList"
              :key="item.id"
              :label="item.name + '【' + item.code + '】'"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商户名" prop="name">
          <el-input v-model="temp.name" placeholder="商户名" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="temp.status">
            <el-radio-button :label="1">启用</el-radio-button>
            <el-radio-button :label="0">停用</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="temp.type" :disabled="dialogStatus == 'update'">
            <el-radio-button :label="1">商户</el-radio-button>
            <el-radio-button :label="2">代理</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="temp.type == 1" label="商户公钥" prop="publicKey">
          <el-input v-model="temp.publicKey" type="textarea" :rows="4" placeholder="商户公钥" />
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
            <el-button v-permission="'merchant:merchantRisk:edit'" type="text" style="color: #67c23a;" @click="handleRiskUpdate(scope.row)">修改</el-button>
            <el-button v-permission="'merchant:merchantRisk:remove'" type="text" style="color: #f56c6c;" @click="deleteRiskData(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog :title="riskTextMap[dialogRiskStatus]" :visible.sync="dialogRiskFormVisible" width="40%">
      <el-form ref="riskDataForm" :rules="riskRules" :model="riskTemp" label-position="left" label-width="80px" style="width: 80%; margin-left:50px;">
        <el-form-item label="单笔最大" prop="oneAmountMax">
          <el-input v-model="riskTemp.oneAmountMax" placeholder="单笔最大限额" />
        </el-form-item>
        <el-form-item label="单笔最小" prop="oneAmountMin">
          <el-input v-model="riskTemp.oneAmountMin" placeholder="单笔最小限额" />
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
            <el-button v-permission="'merchant:merchantRisk:edit'" type="text" style="color: #67c23a;" @click="handleRiskUpdate(scope.row)">修改</el-button>
            <el-button v-permission="'merchant:merchantRisk:remove'" type="text" style="color: #f56c6c;" @click="deleteRiskData(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <el-dialog title="公钥" :visible.sync="dialogKeyFormVisible" width="40%">
      <el-form :model="keyTemp" label-position="left">
        <el-form-item label="商户公钥" prop="publicKey">
          <el-input v-model="keyTemp.publicKey" type="textarea" :rows="4" placeholder="商户公钥" />
        </el-form-item>
        <el-form-item label="平台公钥" prop="platPublicKey">
          <el-input v-model="keyTemp.platPublicKey" type="textarea" :rows="4" placeholder="平台公钥" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-permission="'merchant:merchant:refreshKeys'" type="primary" @click="refreshPlatKeys(keyTemp.id)">
          刷新密钥
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { page, list, add, edit, remove, refreshKeys } from '@/api/merchant'
import { list as getUserList } from '@/api/user'
import { riskList, riskAdd, riskEdit, riskRemove } from '@/api/merchantRisk'
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
    typeFilter(type) {
      const typeMap = {
        1: '商户',
        2: '代理'
      }
      return typeMap[type]
    },
    statusTypeFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'danger'
      }
      return statusMap[status]
    },
    riskCommonFilter(val) {
      if (val) {
        return val
      } else {
        return '不限额'
      }
    }
  },
  data() {
    return {
      textMap: {
        update: '修改',
        create: '新增'
      },
      riskTextMap: {
        update: '修改',
        create: '新增'
      },
      merchantCode: undefined,
      userList: undefined,
      dialogFormVisible: false,
      dialogKeyFormVisible: false,
      dialogStatus: '',
      dialogRiskFormVisible: false,
      dialogRiskVisible: false,
      dialogRiskStatus: '',
      riskList: undefined,
      agentList: undefined,
      riskLoading: true,
      list: undefined,
      listLoading: true,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        type: undefined,
        status: undefined,
        name: undefined,
        code: undefined
      },
      temp: {
        id: undefined,
        agentId: undefined,
        userId: undefined,
        name: undefined,
        publicKey: undefined,
        status: undefined,
        type: undefined
      },
      riskTemp: {
        id: undefined,
        merchantCode: undefined,
        oneAmountMax: undefined,
        oneAmountMin: undefined,
        dayStartTime: undefined,
        dayEndTime: undefined,
        status: undefined
      },
      keyTemp: {
        id: undefined,
        publicKey: undefined,
        platPublicKey: undefined
      },
      rules: {
        userId: [{ required: true, message: '请选择关联的用户', trigger: 'blur' }],
        name: [{ required: true, message: '商户名不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '商户类型不能为空', trigger: 'blur' }]
      },
      riskRules: {
        dayStartTime: [{ required: true, message: '交易开始时间不能为空', trigger: 'blur' }],
        dayEndTime: [{ required: true, message: '交易结束时间不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      page(this.listQuery.page, this.listQuery.limit, this.listQuery.type, this.listQuery.status, this.listQuery.name ? this.listQuery.name : undefined, this.listQuery.code ? this.listQuery.code : undefined).then(response => {
        if (response.data) {
          this.list = response.data.list
        }
        this.total = response.data.total
        this.listLoading = false
      })
      this.getRoleData()
      this.getAgentList()
    },
    refreshPlatKeys(id) {
      refreshKeys(id).then(response => {
        if (response.code === 0) {
          this.fetchData()
          this.dialogKeyFormVisible = false
          this.$message({
            type: 'success',
            message: '刷新成功!'
          })
        }
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    getRoleData() {
      getUserList().then(response => {
        this.userList = response.data
      })
    },
    getAgentList() {
      list(2).then(response => {
        this.agentList = response.data
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        agentId: undefined,
        userId: undefined,
        name: undefined,
        publicKey: undefined,
        status: 1,
        type: 1
      }
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
      this.temp.agentId = row.agentId
      this.temp.userId = row.userId
      this.temp.name = row.name
      this.temp.publicKey = row.publicKey
      this.temp.status = row.status
      this.temp.type = row.type
    },
    handleKeys(row) {
      this.keyTemp.publicKey = row.publicKey
      this.keyTemp.platPublicKey = row.platPublicKey
      this.keyTemp.id = row.id
      this.dialogKeyFormVisible = true
    },
    handleupdate(row) {
      this.setUpdateTemp(row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    resetRiskTemp() {
      this.riskTemp.id = undefined
      this.riskTemp.merchantCode = this.merchantCode
      this.riskTemp.oneAmountMax = undefined
      this.riskTemp.oneAmountMin = undefined
      this.riskTemp.dayStartTime = undefined
      this.riskTemp.dayEndTime = undefined
      this.riskTemp.status = 1
    },
    setRiskUpdateTemp(row) {
      this.riskTemp.id = row.id
      this.riskTemp.oneAmountMax = row.oneAmountMax
      this.riskTemp.oneAmountMin = row.oneAmountMin
      this.riskTemp.dayStartTime = row.dayStartTime
      this.riskTemp.dayEndTime = row.dayEndTime
      this.riskTemp.status = row.status
    },
    fixAmount() {
      if (this.riskTemp.oneAmountMax === '') {
        this.riskTemp.oneAmountMax = undefined
      }
      if (this.riskTemp.oneAmountMin === '') {
        this.riskTemp.oneAmountMin = undefined
      }
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
          this.fixAmount()
          riskAdd(this.riskTemp).then(response => {
            if (response.code === 0) {
              this.dialogRiskFormVisible = false
              this.handlerRisk(this.merchantCode)
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
          this.fixAmount()
          riskEdit(this.riskTemp).then(response => {
            if (response.code === 0) {
              this.dialogRiskFormVisible = false
              this.handlerRisk(this.merchantCode)
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
            this.handlerRisk(this.merchantCode)
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
          }
        })
      }).catch(() => {
      })
    },
    handlerRisk(merchantCode) {
      this.riskLoading = true
      this.dialogRiskVisible = true
      this.merchantCode = merchantCode
      riskList(merchantCode).then(response => {
        this.riskList = response.data
        this.riskLoading = false
      })
    },
    createData() {
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
      this.$confirm('确定删除该商户吗?', '警告', {
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
