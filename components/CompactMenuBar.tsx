import React from 'react'
import {
  Box,
  Flex,
  HStack,
  Text,
  Select,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
  Tooltip,
  Badge,
  useColorModeValue,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  VStack,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Checkbox,
  Spacer
} from '@chakra-ui/react'
import {
  AttachmentIcon,
  SettingsIcon,
  ViewIcon,
  RepeatIcon,
  ChevronDownIcon,
  WarningIcon,
  InfoIcon,
  CheckCircleIcon,
  AddIcon,
  HamburgerIcon
} from '@chakra-ui/icons'
import { motion } from 'framer-motion'

const MotionIconButton = motion(IconButton)
const MotionButton = motion(Button)

export type ViewType = 'graph' | 'table' | 'timeline' | 'cards' | 'dashboard' | 'geomap'

interface CompactMenuBarProps {
  // View controls
  currentView: ViewType
  onViewChange: (view: ViewType) => void
  nodeCount: number
  edgeCount: number
  selectedNodesCount: number

  // Dataset management
  onManageDatasets: () => void
  onHelp?: () => void

  // Topology-specific controls (only shown when currentView === 'graph')
  currentLayout?: string
  onLayoutChange?: (layout: string) => void
  onApplyLayoutAndCenter?: () => void
  onResetAndShowAll?: () => void

  // Group controls
  onGroupByType?: () => void
  onGroupSelected?: () => void
  onUngroupAll?: () => void
  onResetGroups?: () => void

  // Alarm filters
  alarmFilters?: { [key: string]: boolean }
  onAlarmFilterChange?: (filters: { [key: string]: boolean }) => void

  // Background video controls
  videoEnabled?: boolean
  onVideoToggle?: () => void
  videoOpacity?: number
  onVideoOpacityChange?: (opacity: number) => void

  // Threat path controls
  onCreateThreatPath?: () => void
  threatPathCount?: number

  // Layout options
  layoutOptions?: Array<{ value: string; label: string; description: string }>
}

const CompactMenuBar: React.FC<CompactMenuBarProps> = ({
  currentView,
  onViewChange,
  nodeCount,
  edgeCount,
  selectedNodesCount,
  onManageDatasets,
  onHelp,
  currentLayout,
  onLayoutChange,
  onApplyLayoutAndCenter,
  onResetAndShowAll,
  onGroupByType,
  onGroupSelected,
  onUngroupAll,
  onResetGroups,
  alarmFilters,
  onAlarmFilterChange,
  videoEnabled,
  onVideoToggle,
  videoOpacity,
  onVideoOpacityChange,
  onCreateThreatPath,
  threatPathCount,
  layoutOptions
}) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  // View options
  const viewOptions = [
    { value: 'graph', label: 'Topology View', icon: '🕸️' },
    { value: 'table', label: 'Table View', icon: '📊' },
    { value: 'timeline', label: 'Timeline View', icon: '⏰' },
    { value: 'cards', label: 'Cards View', icon: '🗂️' },
    { value: 'dashboard', label: 'Dashboard View', icon: '📈' },
    { value: 'geomap', label: 'Geographic Map', icon: '🗺️' }
  ]

  const currentViewOption = viewOptions.find(option => option.value === currentView)

  // Alarm filter states
  const alarmTypes = [
    { key: 'Alert', label: 'Alert', color: 'red', icon: WarningIcon },
    { key: 'Warning', label: 'Warning', color: 'orange', icon: WarningIcon },
    { key: 'Success', label: 'Success', color: 'green', icon: CheckCircleIcon },
    { key: 'Info', label: 'Info', color: 'blue', icon: InfoIcon },
    { key: 'None', label: 'None', color: 'gray', icon: InfoIcon }
  ]

  const activeAlarmFilters = alarmFilters ? Object.entries(alarmFilters).filter(([_, active]) => active).length : 0

  // Animation variants
  const buttonHover = {
    scale: 1.05,
    transition: { duration: 0.2 }
  }

  const buttonTap = {
    scale: 0.95,
    transition: { duration: 0.1 }
  }

  return (
    <Box
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
      px={4}
      py={2}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Flex align="center" justify="space-between" maxW="1400px" mx="auto">
        {/* Left side - Main controls */}
        <HStack spacing={3}>
          {/* Manage Datasets - Icon only */}
          <Tooltip label="Manage Datasets" placement="bottom" hasArrow>
            <MotionIconButton
              icon={<AttachmentIcon />}
              aria-label="Manage Datasets"
              size="sm"
              variant="outline"
              colorScheme="blue"
              onClick={onManageDatasets}
              whileHover={buttonHover}
              whileTap={buttonTap}
            />
          </Tooltip>

          {/* Help Button */}
          {onHelp && (
            <Tooltip label="Help" placement="bottom" hasArrow>
              <MotionIconButton
                icon={<InfoIcon />}
                aria-label="Help"
                size="sm"
                variant="ghost"
                onClick={onHelp}
                whileHover={buttonHover}
                whileTap={buttonTap}
              />
            </Tooltip>
          )}

          {/* View Selector with inline name */}
          <HStack spacing={2} minW="250px">
            <Text fontSize="sm" fontWeight="medium" color={textColor} minWidth="fit-content">
              View:
            </Text>
            <Select
              value={currentView}
              onChange={(e) => onViewChange(e.target.value as ViewType)}
              size="sm"
              width="180px"
              bg={bgColor}
            >
              {viewOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </Select>
          </HStack>

          {/* Topology-specific controls - only show for graph view */}
          {currentView === 'graph' && (
            <>
              {/* Layout Controls */}
              <Menu>
                <Tooltip label="Layout Controls" placement="bottom" hasArrow>
                  <MenuButton
                    as={MotionIconButton}
                    icon={<RepeatIcon />}
                    aria-label="Layout Controls"
                    size="sm"
                    variant="outline"
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                  />
                </Tooltip>
                <MenuList>
                  <MenuItem onClick={onApplyLayoutAndCenter}>
                    Apply Layout & Center
                  </MenuItem>
                  <MenuItem onClick={onResetAndShowAll}>
                    Reset & Show All
                  </MenuItem>
                  <MenuDivider />
                  {layoutOptions && (
                    <>
                      <Text px={3} py={1} fontSize="xs" color={textColor} fontWeight="bold">
                        Layout Algorithm:
                      </Text>
                      {layoutOptions.slice(0, 5).map(option => (
                        <MenuItem
                          key={option.value}
                          onClick={() => onLayoutChange?.(option.value)}
                          bg={currentLayout === option.value ? hoverBg : 'transparent'}
                          fontWeight={currentLayout === option.value ? 'semibold' : 'normal'}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </>
                  )}
                </MenuList>
              </Menu>

              {/* Group Controls */}
              <Menu>
                <Tooltip label="Group Controls" placement="bottom" hasArrow>
                  <MenuButton
                    as={MotionIconButton}
                    icon={<HamburgerIcon />}
                    aria-label="Group Controls"
                    size="sm"
                    variant="outline"
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                  />
                </Tooltip>
                <MenuList>
                  <MenuItem onClick={onGroupByType}>
                    Group by Type
                  </MenuItem>
                  <MenuItem onClick={onGroupSelected} isDisabled={selectedNodesCount === 0}>
                    Group Selected ({selectedNodesCount})
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={onUngroupAll}>
                    Ungroup All
                  </MenuItem>
                  <MenuItem onClick={onResetGroups}>
                    Reset Groups
                  </MenuItem>
                </MenuList>
              </Menu>

              {/* Alarm Filters */}
              <Popover>
                <Tooltip label="Alarm Filters" placement="bottom" hasArrow>
                  <PopoverTrigger>
                    <MotionIconButton
                      icon={<WarningIcon />}
                      aria-label="Alarm Filters"
                      size="sm"
                      variant="outline"
                      colorScheme={activeAlarmFilters < 5 ? 'orange' : 'gray'}
                      whileHover={buttonHover}
                      whileTap={buttonTap}
                    />
                  </PopoverTrigger>
                </Tooltip>
                <PopoverContent>
                  <PopoverHeader fontWeight="semibold">Alarm Filters</PopoverHeader>
                  <PopoverCloseButton />
                  <PopoverBody>
                    <VStack align="stretch" spacing={2}>
                      {alarmTypes.map(alarm => (
                        <Checkbox
                          key={alarm.key}
                          isChecked={alarmFilters?.[alarm.key] ?? true}
                          onChange={(e) => {
                            if (onAlarmFilterChange && alarmFilters) {
                              onAlarmFilterChange({
                                ...alarmFilters,
                                [alarm.key]: e.target.checked
                              })
                            }
                          }}
                          colorScheme={alarm.color}
                        >
                          <HStack spacing={2}>
                            <alarm.icon color={`${alarm.color}.500`} />
                            <Text>{alarm.label}</Text>
                          </HStack>
                        </Checkbox>
                      ))}
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>

              {/* Background Video Controls */}
              <Popover>
                <Tooltip label="Background Video" placement="bottom" hasArrow>
                  <PopoverTrigger>
                    <MotionIconButton
                      icon={<ViewIcon />}
                      aria-label="Background Video"
                      size="sm"
                      variant="outline"
                      colorScheme={videoEnabled ? 'purple' : 'gray'}
                      whileHover={buttonHover}
                      whileTap={buttonTap}
                    />
                  </PopoverTrigger>
                </Tooltip>
                <PopoverContent>
                  <PopoverHeader fontWeight="semibold">Background Video</PopoverHeader>
                  <PopoverCloseButton />
                  <PopoverBody>
                    <VStack align="stretch" spacing={3}>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Enable Video</Text>
                        <Switch
                          isChecked={videoEnabled}
                          onChange={onVideoToggle}
                          colorScheme="purple"
                        />
                      </HStack>
                      {videoEnabled && (
                        <Box>
                          <Text fontSize="sm" mb={2}>Opacity: {videoOpacity}%</Text>
                          <Slider
                            value={videoOpacity}
                            onChange={onVideoOpacityChange}
                            min={0}
                            max={100}
                            step={5}
                            colorScheme="purple"
                          >
                            <SliderTrack>
                              <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                          </Slider>
                        </Box>
                      )}
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>

              {/* Create Threat Path */}
              <Tooltip label="Create Threat Path" placement="bottom" hasArrow>
                <MotionIconButton
                  icon={<AddIcon />}
                  aria-label="Create Threat Path"
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  onClick={onCreateThreatPath}
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                />
              </Tooltip>
            </>
          )}
        </HStack>

        {/* Right side - Status info */}
        <HStack spacing={4}>
          <Text fontSize="sm" color={textColor}>
            {nodeCount} nodes, {edgeCount} edges
            {selectedNodesCount > 0 && ` • ${selectedNodesCount} selected`}
          </Text>
          {currentView === 'graph' && threatPathCount && threatPathCount > 0 && (
            <Badge colorScheme="red" variant="subtle">
              {threatPathCount} threat paths
            </Badge>
          )}
        </HStack>
      </Flex>
    </Box>
  )
}

export default CompactMenuBar

