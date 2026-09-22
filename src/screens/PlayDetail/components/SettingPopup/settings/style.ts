import { createStyle } from '@/utils/tools'

export default createStyle({
  card: {
    marginHorizontal: 14,
    marginVertical: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  settingRow: {
    marginVertical: 6,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    paddingRight: 10,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  sliderWrap: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  miniActionBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 3,
    marginTop: 6,
  },
  segmentedItem: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  segmentedItemActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentedItemText: {
    fontSize: 13,
    fontWeight: '500',
  },
})
