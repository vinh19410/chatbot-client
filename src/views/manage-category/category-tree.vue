<template>
  <div>
    {{label}}
    <Tree id="my-tree-id" ref="myTree" :custom-options="myCustomOptions" :custom-styles="myCustomStyles"
      :nodes="treeDisplayData"></Tree>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import Tree from 'vuejs-tree';

export default {
  name: 'TreeCategory',
  components: {
    Tree,
  },
  props: {
    treeDisplayData: {
      type: Array,
      required: true,
    },
    label: {
      type: String,
      required: false,
    }
  },
  setup(props, { emit }) {
    // State
    const treeDisplayData = ref(props.treeDisplayData);
    const label = ref(props.label || "Lĩnh vực giám định")
    const myTree = ref(null);

    // Computed properties
    const myCustomStyles = computed(() => ({
      tree: {
        style: {
          height: 'auto',
          maxHeight: '300px',
          overflowY: 'visible',
          display: 'inline-block',
          textAlign: 'left',
        },
      },
      row: {
        style: {
          width: '500px',
          cursor: 'pointer',
        },
        child: {
          class: '',
          style: {
            height: '35px',
          },
          active: {
            style: {
              height: '35px',
            },
          },
        },
      },
      rowIndent: {
        paddingLeft: '20px',
      },
      text: {
        style: {},
        active: {
          style: {
            'font-weight': 'bold',
            color: '#2ECC71',
          },
        },
      },
    }));

    const myCustomOptions = computed(() => ({
      treeEvents: {
        expanded: {
          state: false,
        },
        collapsed: {
          state: false,
        },
        selected: {
          state: false,
          fn: null,
        },
        checked: {
          state: true,
          fn: myCheckedFunction,
        },
      },
      events: {
        expanded: {
          state: true,
        },
        selected: {
          state: true,
        },
        checked: {
          state: true,
        },
        editableName: {
          state: true,
          calledEvent: 'expanded',
        },
      },
      addNode: {
        state: true,
        fn: addNodeFunction,
        appearOnHover: false,
      },
      editNode: { state: false, fn: null, appearOnHover: false },
      deleteNode: {
        state: true,
        fn: deleteNodeFunction,
        appearOnHover: true,
      },
      showTags: true,
    }));

    // Lifecycle hook
    onMounted(() => {
      // myTree.value.expandNode(0);
    });

    // Methods
    function myCheckedFunction(nodeId, state) {
      // Uncheck all nodes first
      const uncheckNodes = (nodes) => {
        nodes.forEach(node => {
          node.state.checked = false;
          if (node.nodes) {
            uncheckNodes(node.nodes);
          }
        });
      };
      uncheckNodes(treeDisplayData.value);
      // Check the current node
      const node = findNodeById(treeDisplayData.value, nodeId);
      if (node) {
        node.state.checked = state;
      }
      emit('nodeChecked', { nodeId, state });
    }

    function mySelectedFunction(nodeId, state) {
      console.log(myTree.value.getSelectedNode());
    }

    function deleteNodeFunction(node) {
      const nodePath = myTree.value.findNodePath(node.id);
      const parentNodeId = nodePath.slice(-2, -1)[0];
      if (parentNodeId === undefined) {
        // 'root' node
        const nodeIndex = myTree.value.nodes.findIndex((x) => x.id === node.id);
        myTree.value.nodes.splice(nodeIndex, 1);
      } else {
        // child node
        const parentNode = myTree.value.findNode(parentNodeId);
        const nodeIndex = parentNode.nodes.findIndex((x) => x.id === node.id);
        parentNode.nodes.splice(nodeIndex, 1);
      }
      console.log('example: remove node', node.id);
    }

    function addNodeFunction(node) {
      const newNode = {
        text: 'Grandchild 2',
        id: Math.floor(Math.random() * 100),
        state: { checked: false, selected: false, expanded: false },
      };
      console.log('example: add node', newNode);
      if (!node.nodes) {
        node.nodes = [newNode];
      } else {
        node.nodes.push(newNode);
      }
    }

    // Helper function to find a node by ID
    function findNodeById(nodes, id) {
      for (let node of nodes) {
        if (node.id === id) {
          return node;
        }
        if (node.nodes) {
          const found = findNodeById(node.nodes, id);
          if (found) return found;
        }
      }
      return null;
    }

    return {
      treeDisplayData,
      myTree,
      myCustomStyles,
      myCustomOptions,
      myCheckedFunction,
      mySelectedFunction,
      deleteNodeFunction,
      addNodeFunction,
      label
    };
  },
};
</script>

<style>
/* CSS để ẩn các nút "+" và "-" */
.icon_parent {
  display: none !important;
}

.capitalize {
  margin-inline-start: 5px;
}

.folder_icon,
.folder_icon_active {
  margin-inline-end: 10px;
}
</style>
