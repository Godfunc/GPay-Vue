<template>
  <div class="app-container">
    <div v-permission="'mg:menu:rootadd'" class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate(0)">
        新增根菜单
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      element-loading-text="Loading"
      :data="list"
      row-key="id"
      style="width: 100%"
      border
      :tree-props="{children: 'children'}"
    >
      <el-table-column label="名称" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="路由" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <el-link type="primary" :underline="false">{{ scope.row.path }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="component" label="类型" width="180" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.type | typeTypeFilter">{{ scope.row.type | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="标题" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图标" align="center">
        <template slot-scope="scope">
          <span><svg-icon :icon-class="scope.row.icon" /></span>
        </template>
      </el-table-column>
      <el-table-column label="隐藏" align="center" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusTypeFilter">{{ scope.row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="redirect" label="重定向" />
      <el-table-column prop="sort" label="排序" align="center" width="60" />
      <el-table-column label="操作" align="center" width="140" fixed="right">
        <template slot-scope="scope">
          <el-button v-if="scope.row.type == 1" v-permission="'mg:menu:add'" type="text" @click="handleCreate(scope.row.id)">新增</el-button>
          <el-button v-permission="'mg:menu:edit'" type="text" @click="handleEdit(scope.row)">修改</el-button>
          <el-button v-permission="'mg:menu:remove'" type="text" @click="deleteData(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 80%; margin-left:50px;">
        <el-radio v-model="temp.type" :disabled="radioStatus" :label="1">菜单</el-radio>
        <el-radio v-model="temp.type" :disabled="radioStatus" :label="2">按钮</el-radio>
        <el-collapse v-model="activeCollapse" accordion style="margin-top: 10px;">
          <el-collapse-item name="1">
            <template slot="title">
              <el-link :underline="false" type="primary">基本设置</el-link>
            </template>
            <el-form-item label="名称" prop="name">
              <el-input v-model="temp.name" placeholder="名称" />
            </el-form-item>
            <el-form-item v-if="temp.type==1" label="路由" prop="path">
              <el-input v-model="temp.path" placeholder="路由地址" />
            </el-form-item>
            <el-form-item v-if="temp.type==1" label="组件" prop="component">
              <el-input v-model="temp.component" placeholder="组件名称" />
            </el-form-item>
            <el-form-item v-if="temp.type==1" label="标题" prop="title">
              <el-input v-model="temp.title" placeholder="标题" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="temp.status">
                <el-radio-button label="1">启用</el-radio-button>
                <el-radio-button label="0">停用</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="权限" prop="permissions">
              <el-input v-model="temp.permissions" placeholder="多个权限用 , 分隔。例如：manage:menu,manage:user" />
            </el-form-item>
            <el-form-item v-if="temp.type==1" label="图标" prop="icon">
              <el-popover
                ref="iconListPopover"
                placement="bottom-start"
                trigger="click"
                popper-class="menu-icon-popover"
              >
                <el-row :gutter="10">
                  <el-col>
                    <el-button
                      v-for="(item, index) in iconList"
                      :key="index"
                      size="small"
                      style="margin-top: 10px; margin-left:6px"
                      :class="{ 'is-active': item === temp.icon }"
                      @click="temp.icon = item"
                    >
                      <svg-icon :icon-class="item" />
                    </el-button>
                  </el-col>
                </el-row>
              </el-popover>
              <el-input v-model="temp.icon" v-popover:iconListPopover :readonly="true" placeholder="图标" />
            </el-form-item>
          </el-collapse-item>
          <el-collapse-item v-if="temp.type==1" name="2">
            <template slot="title">
              <el-link :underline="false" type="primary">高级设置</el-link>
            </template>
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="temp.sort" :min="0" :max="9999" />
            </el-form-item>
            <el-form-item label="重定向">
              <el-input v-model="temp.redirect" />
            </el-form-item>
            <el-form-item label="高亮菜单">
              <el-input v-model="temp.activeMenu" />
            </el-form-item>
            <el-form-item label="面包屑">
              <el-radio-group v-model="temp.breadcrumb">
                <el-radio-button label="true">显示</el-radio-button>
                <el-radio-button label="false">隐藏</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="一直显示">
              <el-radio-group v-model="temp.alwaysShow">
                <el-radio-button label="true">是</el-radio-button>
                <el-radio-button label="false">否</el-radio-button>
              </el-radio-group>
            </el-form-item>

          </el-collapse-item>
        </el-collapse>
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

  </div>
</template>

<script>
import { getAll, remove, add, edit } from '@/api/menu'
import Icon from '@/icons'

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
    typeFilter(type) {
      const typeMap = {
        1: '菜单',
        2: '按钮'
      }
      return typeMap[type]
    },
    typeTypeFilter(type) {
      const statusMap = {
        1: 'success',
        2: 'warning'
      }
      return statusMap[type]
    }
  },
  data() {
    return {
      list: undefined,
      listLoading: true,
      iconList: [],
      textMap: {
        update: '修改',
        create: '新增'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      activeCollapse: '1',
      radioStatus: false,
      temp: {
        id: undefined,
        pid: undefined,
        path: undefined,
        component: undefined,
        type: undefined,
        redirect: undefined,
        name: undefined,
        alwaysShow: undefined,
        permissions: undefined,
        sort: undefined,
        status: undefined,
        title: undefined,
        icon: undefined,
        breadcrumb: undefined,
        activeMenu: undefined
      },
      rules: {
        path: [{ required: true, message: '路由地址不能为空', trigger: 'change' }],
        component: [{ required: true, message: '组件不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.fetchData()
    this.iconList = Icon.getIconList()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getAll().then(response => {
        if (response.data) {
          this.list = response.data
        }
        this.listLoading = false
      })
    },
    resetTemp() {
      this.activeCollapse = '1'
      this.temp = {
        id: undefined,
        pid: undefined,
        path: undefined,
        component: undefined,
        redirect: '',
        name: '',
        type: 1,
        alwaysShow: false,
        permissions: '',
        sort: 0,
        status: 1,
        title: '',
        icon: '',
        breadcrumb: true,
        activeMenu: ''
      }
    },
    handleCreate(id) {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
      this.temp.pid = id
      if (id === 0) {
        this.temp.component = 'Layout'
        this.radioStatus = true
      } else {
        this.radioStatus = false
      }
    },
    setUpdateTemp(row) {
      this.temp.id = row.id
      this.temp.pid = row.pid
      this.temp.path = row.path
      this.temp.component = row.component
      this.temp.redirect = row.redirect
      this.temp.name = row.name
      this.temp.type = row.type
      this.temp.alwaysShow = row.alwaysShow
      this.temp.permissions = row.permissions
      this.temp.sort = row.sort
      this.temp.status = row.status
      this.temp.title = row.title
      this.temp.icon = row.icon
      this.temp.breadcrumb = row.breadcrumb
      this.temp.activeMenu = row.activeMenu
    },
    handleEdit(row) {
      this.activeCollapse = '1'
      this.radioStatus = true
      this.setUpdateTemp(row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.temp.type === 2) {
            this.temp.component = 'Button'
          }
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
                message: '新增成功!'
              })
            }
          })
        }
      })
    },
    deleteData(id) {
      this.$confirm('确定删除该菜单及子菜单吗?', '警告', {
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

<style lang="scss">
.menu-icon-popover {
  max-width: 380px;
}
</style>
