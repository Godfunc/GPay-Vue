<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" v-permission="'merchant:payChannelAccount:page'" clearable placeholder="名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.channelCode" v-permission="'merchant:payChannelAccount:page'" clearable placeholder="渠道子类编号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.accountCode" v-permission="'merchant:payChannelAccountA:page'" clearable placeholder="账号商户号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" v-permission="'merchant:payChannelAccount:page'" placeholder="状态" clearable style="width: 90px" class="filter-item">
        <el-option key="1" label="启用" value="1" />
        <el-option key="0" label="停用" value="0" />
      </el-select>
      <el-button v-waves v-permission="'merchant:payChannelAccount:page'" class="filter-item" type="info" icon="el-icon-search" @click="handleFilter">
        查询
      </el-button>
      <el-button v-permission="'merchant:payChannelAccount:add'" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
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
      <el-table-column label="渠道编号" align="center">
        <template slot-scope="scope">
          {{ scope.row.channelCode }}
        </template>
      </el-table-column>
      <el-table-column label="商户号" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          {{ scope.row.accountCode }}
        </template>
      </el-table-column>
      <el-table-column label="权重" width="60" align="center">
        <template slot-scope="scope">
          {{ scope.row.weight }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="风控" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.riskType | riskTypeFilter">{{ scope.row.riskType | riskFilter }}</el-tag>
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
          <el-button v-permission="'merchant:payChannelAccount:edit'" style="color: #67c23a;" type="text" @click="handleupdate(scope.row)">修改</el-button>
          <el-button v-permission="'merchant:channelRisk:listByAccount'" type="text" style="color: #e6a23c;" @click="handleRisk(scope.row.id, scope.row.channelId)">风控</el-button>
          <el-button v-permission="'merchant:payChannelAccount:remove'" style="color: #f56c6c;" type="text" @click="deleteData(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="fetchData" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 80%; margin-left:50px;">
        <el-form-item label="渠道子类" prop="channelId">
          <el-select v-model="temp.channelId" style="width:100%" placeholder="请选择渠道子类">
            <el-option
              v-for="item in channelList"
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
          <el-input v-model="temp.accountCode" placeholder="商户号" />
        </el-form-item>
        <el-form-item label="密钥信息" prop="keyInfo">
          <el-input v-model="temp.keyInfo" type="textarea" :rows="4" placeholder="商户下单密钥" />
        </el-form-item>
        <el-form-item label="权重" prop="weight">
          <el-input-number v-model="temp.weight" :min="0" :max="10" />
        </el-form-item>
        <el-form-item label="风控类型" prop="riskType">
          <el-radio-group v-model="temp.riskType">
            <el-radio-button :label="2">自定义</el-radio-button>
            <el-radio-button :label="1">使用通道</el-radio-button>
            <el-radio-button :label="0">不设置</el-radio-button>
          </el-radio-group>
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
    <channel-risk ref="channelRisk" />
  </div>
</template>

<script>
import { page, add, edit, remove } from '@/api/payChannelAccount'
import { list } from '@/api/payChannel'
import Pagination from '@/components/Pagination'
import channelRisk from './channelRisk'

export default {
  components: {
    Pagination,
    'channel-risk': channelRisk
  },
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
    riskFilter(riskType) {
      const riskTypeMap = {
        2: '自定义',
        1: '通道',
        0: '未设置'
      }
      return riskTypeMap[riskType]
    },
    riskTypeFilter(riskType) {
      const riskTypeMap = {
        2: 'info',
        1: 'Warning',
        0: 'danger'
      }
      return riskTypeMap[riskType]
    }
  },
  data() {
    return {
      textMap: {
        update: '修改',
        create: '新增'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      list: undefined,
      listLoading: true,
      channelList: undefined,
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        status: undefined,
        name: undefined,
        channelCode: undefined,
        accountCode: undefined
      },
      temp: {
        id: undefined,
        name: undefined,
        channelId: undefined,
        accountCode: undefined,
        status: undefined,
        keyInfo: undefined,
        weight: undefined,
        riskType: undefined
      },
      rules: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
        channelId: [{ required: true, message: '渠道子类不能为空', trigger: 'blur' }],
        accountCode: [{ required: true, message: '账号商户号不能为空', trigger: 'blur' }],
        weight: [{ required: true, message: '权重不能为空', trigger: 'blur' }],
        riskType: [{ required: true, message: '风控类型不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      page(this.listQuery.page, this.listQuery.limit, this.listQuery.status, this.listQuery.channelCode ? this.listQuery.channelCode : undefined, this.listQuery.name ? this.listQuery.name : undefined, this.listQuery.accountCode ? this.listQuery.accountCode : undefined).then(response => {
        if (response.data) {
          this.list = response.data.list
        }
        this.total = response.data.total
        this.listLoading = false
      })
      this.getChannelData()
    },
    getChannelData() {
      list().then(response => {
        this.channelList = response.data
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
        channelId: undefined,
        accountCode: undefined,
        status: 1,
        keyInfo: undefined,
        weight: 1,
        riskType: 0
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
      this.temp.name = row.name
      this.temp.channelId = row.channelId
      this.temp.accountCode = row.accountCode
      this.temp.status = row.status
      this.temp.keyInfo = row.keyInfo
      this.temp.weight = row.weight
      this.temp.riskType = row.riskType
    },
    handleupdate(row) {
      this.setUpdateTemp(row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleRisk(id, channelId) {
      this.$refs.channelRisk.handleRisk(id, channelId)
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
