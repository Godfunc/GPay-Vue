<template>
  <div>
    <el-dialog title="风控" :visible.sync="dialogVisible" width="60%">
      <el-button size="small" style="margin-bottom: 5px;" class="filter-item" type="primary" icon="el-icon-edit" @click="handleRiskCreate">
        新增
      </el-button>
      <el-table
        v-loading="loading"
        :data="list"
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-form ref="riskDataForm" :rules="rules" :model="temp" label-position="left" label-width="80px" style="width: 80%; margin-left:50px;">
        <el-form-item label="单笔最大" prop="oneAmountMax">
          <el-input v-model="temp.oneAmountMax" placeholder="单笔最大限额" />
        </el-form-item>
        <el-form-item label="单笔最小" prop="oneAmountMin">
          <el-input v-model="temp.oneAmountMin" placeholder="单笔最小限额" />
        </el-form-item>
        <el-form-item label="开始时间" prop="dayStartTime">
          <el-time-picker
            v-model="temp.dayStartTime"
            placeholder="交易开始时间"
            value-format="HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="dayStartTime">
          <el-time-picker
            v-model="temp.dayEndTime"
            placeholder="交易结束时间"
            value-format="HH:mm:ss"
          />
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
        <el-button type="primary" @click="dialogStatus==='create'?createRiskData():updateRiskData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { list, add, edit, remove } from '@/api/merchantRisk'

export default {
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
      merchantCode: undefined,
      dialogFormVisible: false,
      dialogVisible: false,
      dialogStatus: '',
      list: undefined,
      loading: true,
      temp: {
        id: undefined,
        merchantCode: undefined,
        oneAmountMax: undefined,
        oneAmountMin: undefined,
        dayStartTime: undefined,
        dayEndTime: undefined,
        status: undefined
      },
      rules: {
        dayStartTime: [{ required: true, message: '交易开始时间不能为空', trigger: 'blur' }],
        dayEndTime: [{ required: true, message: '交易结束时间不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    resetTemp() {
      this.temp.id = undefined
      this.temp.merchantCode = this.merchantCode
      this.temp.oneAmountMax = undefined
      this.temp.oneAmountMin = undefined
      this.temp.dayStartTime = undefined
      this.temp.dayEndTime = undefined
      this.temp.status = 1
    },
    setRiskUpdateTemp(row) {
      this.temp.id = row.id
      this.temp.oneAmountMax = row.oneAmountMax
      this.temp.oneAmountMin = row.oneAmountMin
      this.temp.dayStartTime = row.dayStartTime
      this.temp.dayEndTime = row.dayEndTime
      this.temp.status = row.status
    },
    fixAmount() {
      if (this.temp.oneAmountMax === '') {
        this.temp.oneAmountMax = undefined
      }
      if (this.temp.oneAmountMin === '') {
        this.temp.oneAmountMin = undefined
      }
    },
    handleRiskCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['riskDataForm'].clearValidate()
      })
    },
    handleRiskUpdate(row) {
      this.setRiskUpdateTemp(row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['riskDataForm'].clearValidate()
      })
    },
    createRiskData() {
      console.log(this.temp)
      this.$refs['riskDataForm'].validate((valid) => {
        if (valid) {
          this.fixAmount()
          add(this.temp).then(response => {
            if (response.code === 0) {
              this.dialogFormVisible = false
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
          edit(this.temp).then(response => {
            if (response.code === 0) {
              this.dialogFormVisible = false
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
        remove(id).then(response => {
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
      this.loading = true
      this.dialogVisible = true
      this.merchantCode = merchantCode
      list(merchantCode).then(response => {
        this.list = response.data
        this.loading = false
      })
    }
  }
}
</script>
